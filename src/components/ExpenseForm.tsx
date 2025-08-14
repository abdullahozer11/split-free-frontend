import React, {useState, useEffect} from "react";
import {useNavigation} from "expo-router";
import {useMemberList} from "@/src/api/members";
import {useInsertExpense, useUpdateExpense} from "@/src/api/expenses";
import {
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {getFormattedDate, formatDate} from "@/src/utils/helpers";
import {ActivityIndicator, Avatar, Tooltip} from "react-native-paper";
import {
  Button,
  TextInput,
  Text,
  useTranslatedAlert,
  useTranslations,
} from "@/src/components/Translated";
import DateTimePicker from "@react-native-community/datetimepicker";
import MultiSelect from "@/src/components/MultiSelect";
import {Feather, FontAwesome6, MaterialIcons} from "@expo/vector-icons";
import {useQueryClient} from "@tanstack/react-query";
import {exp_cats} from "@/src/utils/expense_categories";
import {supabase} from "@/src/lib/supabase.ts";
import {translations} from "@/src/translations";
import {useSettings} from "@/src/providers/SettingsProvider.js";
import CustomDropdown from "@/src/components/CustomDropdown";
import { useAuth } from "@/src/providers/AuthProvider";

const renderCatItem = (item) => {
  return (
    <View className={"flex-row h-12 px-2 justify-between items-center"}>
      <Text className={"text-sm font-medium"}>{item.label}</Text>
      <MaterialIcons size={24} name={item.icon} color="black"/>
    </View>
  );
};

export default function ExpenseForm({
                                      title: headerTitle,
                                      groupId,
                                      updatingExpense,
                                    }) {
  const {t} = useTranslations();
  const {alert} = useTranslatedAlert();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setLoading] = useState();
  const {settings} = useSettings();
  const int = translations[settings.language] || translations.en;
  const { session } = useAuth();

  const [formState, setFormState] = useState(
    updatingExpense
      ? {
        ...updatingExpense,
        id: updatingExpense.id,
        amount: updatingExpense.amount.toString(),
        payers: updatingExpense.payer_ids,
        participants: updatingExpense.participant_ids,
        inputDate: new Date(updatingExpense.date),
      }
      : {
        title: "",
        description: "",
        payers: [],
        participants: [],
        amount: "0",
        category: "Other",
        group_id: groupId,
        inputDate: new Date(),
      },
  );

  const isUpdating = !!updatingExpense;

  const {mutate: insertExpense} = useInsertExpense();
  const {mutate: updateExpense} = useUpdateExpense();
  const {
    data: members,
    isError: membersError,
    isLoading: membersLoading,
  } = useMemberList(groupId);

  useEffect(() => {
    if (!members || membersLoading || !session || isUpdating || formState.payers.length > 0) return;
    const currentMember = members.find(member => member.profile === session.user.id);
    if (currentMember) {
      setFormState(prev => ({...prev, payers: [currentMember.id]}));
    }
  }, [members, membersLoading, session, isUpdating, formState.payers]);

  if (membersLoading) {
    return <ActivityIndicator/>;
  }

  if (membersError) {
    console.log(membersError);
    return <Text variant={"headlineLarge"}>Failed to fetch data</Text>;
  }

  const {
    title,
    description,
    payers,
    participants,
    amount,
    group_id,
    inputDate,
    category,
  } = formState;

  const onDateChange = (event, selectedDate) => {
    if (event.type === "set") {
      const date = selectedDate;
      setShowDatePicker(false);
      handleInputChange("inputDate", date);
    } else {
      setShowDatePicker(false);
    }
  };

  const validateData = () => {
    if (!title) {
      console.log("Title is empty");
      alert("Title is empty");
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      console.log("Amount is not valid");
      alert("Amount is not valid");
      return false;
    }

    if (!payers.length) {
      console.log("Add who paid this expense");
      alert("Add who paid this expense");
      return false;
    }

    if (!participants.length) {
      console.log("Add at least one participant");
      alert("Add at least one participant");
      return false;
    }

    return true;
  };

  const onSubmit = async () => {
    if (!validateData()) {
      console.log("Validation failed");
      return;
    }

    if (isUpdating) {
      await onUpdate();
    } else {
      await onCreate();
    }
  };

  const onUpdate = async () => {
    // console.log("Updating expense")
    // console.log(groupId, "//", title,"//", description,"//", amount,"//", inputDate,"//", payers,"//", participants)
    updateExpense(
      {
        id: updatingExpense.id,
        amount: amount,
        date: formatDate(inputDate),
        description: description,
        category: category,
        participants: participants,
        payers: payers,
        proof: null,
        title: title,
      },
      {
        onSuccess: async () => {
          console.log("Successfully updated expense");
          navigation.goBack();
          await queryClient.invalidateQueries(["group", group_id]);
          await queryClient.invalidateQueries(["expense", updatingExpense.id]);
          await queryClient.invalidateQueries(["expenses", group_id]);
        },
        onError: (error) => {
          console.error("Server error:", error);
          alert("Error", "Server error.");
        },
      },
    );
  };

  const onCreate = async () => {
    // console.log(groupId, "//", title,"//", description,"//", amount,"//", inputDate,"//", payers,"//", participants)
    insertExpense(
      {
        group_id: groupId,
        title: title,
        description: description ? description : null,
        category: category,
        amount: amount,
        date: formatDate(inputDate),
        proof: null,
        payers: payers,
        participants: participants,
      },
      {
        onSuccess: async () => {
          // console.log("Successfully inserted expense");
          navigation.goBack();
          await queryClient.invalidateQueries(["group", group_id]);
          await queryClient.invalidateQueries(["expenses", group_id]);
        },
        onError: (error) => {
          console.error("Server error:", error);
          alert("Error", "Server error.");
        },
      },
    );
  };

  const handleGenerateCat = async () => {
    // check if title is not empty
    if (!title) {
      alert("You must enter a title first");
      return;
    }

    setLoading(true);
    // make a call to the edge function
    const {data, error} = await supabase.functions.invoke("gemini", {
      body: JSON.stringify({title: title}),
    });
    setLoading(false);

    if (error) {
      console.log("Server error:", error);
      return;
    }
    const exp_cat_names = exp_cats.map((exp_cat) => exp_cat?.name);
    const newName = data?.name;
    // console.log("new name is ", newName);
    if (exp_cat_names.includes(newName)) {
      handleInputChange("category", newName);
    } else {
      handleInputChange("category", "other");
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormState((prevFormState) => ({
      ...prevFormState,
      [fieldName]: value,
    }));
  };

  // Get the translated category name for display
  const getDisplayCategoryName = (categoryKey) => {
    return int[categoryKey] || categoryKey;
  };

  // Prepare data for CustomDropdown
  const categoryData = exp_cats.map((item) => ({
    label: getDisplayCategoryName(item.name),
    value: item.name,
    icon: item.icon,
  }));

  const payerData = members.map((member) => ({
    label: member.name,
    value: member.id,
  }));

  return (
    <ScrollView className={"flex-1"}>
      <View
        className={"mt-1 bg-transparent flex-row justify-between items-center"}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Feather className={"font-bold"} name={"arrow-left"} size={32}/>
        </TouchableOpacity>
        <TouchableOpacity
          className={"bg-white p-1 h-12 rounded-md justify-center items-center"}
          onPress={() => {
            onSubmit();
          }}
        >
          <Text variant={"headlineLarge"} className={"font-semibold"}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
      <Text variant="headlineLarge" className={"my-3"}>
        {headerTitle}
      </Text>
      <View className={"gap-2"}>
        <View>
          <TextInput
            label="Enter expense title"
            placeholder={t("Describe your expense")}
            value={title}
            onChangeText={(text) => {
              handleInputChange("title", text);
            }}
            className={"bg-white"}
          />
        </View>
        <View>
          <TextInput
            label="Enter expense description (optional)"
            placeholder={t("Give additional information")}
            value={description}
            onChangeText={(text) => {
              handleInputChange("description", text);
            }}
            multiline={true}
            className={"bg-white"}
          />
        </View>
        <View className={"flex-row gap-x-1"}>
          <TextInput
            label="Enter Amount"
            placeholder="Enter Amount"
            value={amount}
            onChangeText={(text) =>
              handleInputChange(
                "amount",
                text.replace(",", ".").replace(/^0+(?!$)/, ""),
              )
            }
            keyboardType="numeric"
            className={"flex-1 bg-white"}
          />
          <Pressable
            onPress={() => {
              setShowDatePicker(!showDatePicker);
            }}
            className={"bg-white px-2 rounded justify-center"}
          >
            <Text variant={"labelMedium"}>{getFormattedDate(inputDate)}</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              mode={"date"}
              display={"spinner"}
              value={inputDate}
              onChange={onDateChange}
            />
          )}
        </View>
        <View style={{gap: 10}}>
          <View style={{gap: 10}} className={"flex-row items-center"}>
            <Avatar.Image
              size={48}
              source={require("@/assets/images/blank-profile.png")}
            />
            <CustomDropdown
              data={payerData}
              label={"Who paid?"}
              value={payers[0]}
              onChange={(newValue) => {
                handleInputChange("payers", [newValue]);
              }}
              placeholder={int["Select item"]}
              containerClassName="flex-1"
            />
          </View>
          <MultiSelect
            selected={participants}
            members={members}
            onChange={(participants) =>
              handleInputChange("participants", participants)
            }
          />
          <Text variant={"bodyLarge"}>
            Pick expense category or use AI to generate
          </Text>
          <View className={"flex-row gap-4"}>
            <CustomDropdown
              data={categoryData}
              value={category}
              onChange={(newValue) => {
                handleInputChange("category", newValue);
              }}
              placeholder={int["Select a category"]}
              containerClassName="flex-1 bg-white mt-4"
              renderItem={renderCatItem}
            />
            <Tooltip title="Auto generate">
              <Button
                className={"bg-white justify-center rounded-md flex-1"}
                onPress={handleGenerateCat}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator/>
                ) : (
                  <FontAwesome6
                    name={"wand-magic-sparkles"}
                    size={18}
                    color={"black"}
                  />
                )}
              </Button>
            </Tooltip>
          </View>
          <TouchableOpacity
            className={"bg-white rounded-md border-2 border-green-500"}
            onPress={() => {
              onSubmit();
            }}
          >
            <Text className={"font-bold text-center py-4 text-green-500"}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
