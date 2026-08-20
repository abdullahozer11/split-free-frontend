import React, { useState, useEffect } from "react";
import { useNavigation } from "expo-router";
import { useMemberList } from "@/src/api/members";
import {
  useInsertExpense,
  useLatestExpense,
  useUpdateExpense,
} from "@/src/api/expenses";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { getFormattedDate, formatDate } from "@/src/utils/helpers";
import { ActivityIndicator, Avatar } from "react-native-paper";
import { TextInput, Text } from "@/src/components/Translated";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import MyDropdown from "@/src/components/DropdownComponent";
import MyMultiSelect from "@/src/components/MultiSelectComponent";
import { Feather, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { exp_cats } from "@/src/utils/expense_categories";
import { supabase } from "@/src/lib/supabase.ts";
import { translations } from "@/src/translations";
import { useSettings } from "@/src/providers/SettingsProvider";
import { useAuth } from "@/src/providers/AuthProvider";
import { resolveExpenseFormDefaults } from "@/src/utils/expenseFormDefaults";

const renderCatItem = (item) => {
  return (
    <View className={"flex-row h-12 px-2 justify-between items-center"}>
      <Text variant={"titleSmall"}>{item.name}</Text>
      <MaterialIcons size={24} name={item.icon} />
    </View>
  );
};

export default function ExpenseForm({
  title: headerTitle,
  groupId,
  updatingExpense,
}) {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { session, loading: authLoading } = useAuth();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [isLoading, setLoading] = useState();
  const { settings } = useSettings();
  const int = translations[settings.language] || translations.en;
  const isUpdating = !!updatingExpense;
  const [hasAppliedDefaults, setHasAppliedDefaults] = useState(isUpdating);

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

  const { mutate: insertExpense } = useInsertExpense();
  const { mutate: updateExpense } = useUpdateExpense();
  const {
    data: members,
    isError: membersError,
    isLoading: membersLoading,
  } = useMemberList(groupId);
  const {
    data: latestExpense,
    isError: latestExpenseError,
    isLoading: latestExpenseLoading,
  } = useLatestExpense(groupId, !isUpdating);

  useEffect(() => {
    if (isUpdating || hasAppliedDefaults) {
      return;
    }
    if (authLoading || membersLoading) {
      return;
    }
    if (latestExpenseLoading && !latestExpenseError) {
      return;
    }

    const currentMember = members?.find(
      (member) => member.profile === session?.user?.id,
    );
    const { payers, participants } = resolveExpenseFormDefaults({
      latestExpense: latestExpenseError ? null : latestExpense,
      members,
      currentMemberId: currentMember?.id ?? null,
    });

    setFormState((prev) => ({
      ...prev,
      payers,
      participants,
    }));
    setHasAppliedDefaults(true);
  }, [
    isUpdating,
    hasAppliedDefaults,
    authLoading,
    membersLoading,
    latestExpenseLoading,
    latestExpenseError,
    latestExpense,
    members,
    session?.user?.id,
  ]);

  if (membersLoading || (!isUpdating && !hasAppliedDefaults)) {
    return <ActivityIndicator />;
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
      Alert.alert("Title is empty");
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      console.log("Amount is not valid");
      Alert.alert("Amount is not valid");
      return false;
    }

    if (!payers.length) {
      console.log("Add who paid this expense");
      Alert.alert("Add who paid this expense");
      return false;
    }

    if (!participants.length) {
      console.log("Add at least one participant");
      Alert.alert("Add at least one participant");
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
          Alert.alert("Error", "Server error.");
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
          Alert.alert("Error", "Server error.");
        },
      },
    );
  };

  const handleGenerateCat = async () => {
    // check if title is not empty
    if (!title) {
      Alert.alert("You must enter a title first");
      return;
    }

    setLoading(true);
    // make a call to the edge function
    const { data, error } = await supabase.functions.invoke("gemini", {
      body: JSON.stringify({ title: title }),
    });
    setLoading(false);

    if (error) {
      console.error("Server error:", error);
      Alert.alert("Error", "Server error.");
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
          <Feather className={"font-bold"} name={"arrow-left"} size={32} />
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
            placeholder="Describe your expense"
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
            placeholder="Give additional information"
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
        <View style={{ gap: 10 }}>
          <View style={{ gap: 10 }} className={"flex-row items-center"}>
            <Avatar.Image
              size={48}
              source={require("@/assets/images/blank-profile.png")}
            />
            <MyDropdown
              labelField="name"
              placeholder={int["Select item"]}
              valueField="id"
              data={members}
              onChange={(payer) => {
                handleInputChange("payers", [payer]);
              }}
              label={"Who paid?"}
              selected={payers[0]}
            />
          </View>
          <MyMultiSelect
            selected={participants}
            members={members}
            onChange={(participants) =>
              handleInputChange("participants", participants)
            }
          />
          <Text variant={"bodyLarge"}>
            Pick expense category or use AI to generate
          </Text>
          <View className={"flex-row items-center"} style={{ gap: 8 }}>
            <Dropdown
              data={exp_cats}
              labelField={settings.language}
              valueField={"name"}
              placeholder={!isFocus ? int["Select a category"] : "..."}
              onChange={(item) => {
                handleInputChange("category", item.name);
                setIsFocus(false);
              }}
              style={styles.categoryDropdown}
              selectedTextStyle={styles.categorySelectedText}
              renderItem={renderCatItem}
              value={category}
              dropdownPosition={"top"}
            />
            <TouchableOpacity
              style={styles.aiButton}
              onPress={handleGenerateCat}
              disabled={isLoading}
              accessibilityLabel="Auto generate"
            >
              {isLoading ? (
                <ActivityIndicator />
              ) : (
                <FontAwesome6
                  name={"wand-magic-sparkles"}
                  size={18}
                  color={"black"}
                />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className={"bg-white rounded-md border-2 border-green-500"}
            style={styles.saveButton}
            onPress={() => {
              onSubmit();
            }}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoryDropdown: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  categorySelectedText: {
    fontSize: 16,
    marginLeft: 4,
  },
  aiButton: {
    width: 48,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  saveButtonText: {
    fontWeight: "700",
    color: "#22c55e",
    fontSize: 16,
  },
});
