import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import React, {useEffect, useState} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dropdown } from 'react-native-element-dropdown';
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import {useAuth} from "@/src/providers/AuthProvider";
import {useProfile, useUpdateProfileSingleField} from "@/src/api/profiles";

const Languages = () => {
  const navigation = useNavigation();
  const [language, setLanguage] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const data = [
    { label: 'English', value: 'en' },
    { label: 'French', value: 'fr' },
  ];

  const {session} = useAuth();
  const {data: profile, isLoading, isError} = useProfile(session?.user.id);

  const {mutate: updateProfileSF} = useUpdateProfileSingleField();

  useEffect(() => {
    setLanguage(profile?.language);
  }, []);

  if (isLoading) {
    return <ActivityIndicator/>;
  }

  if (isError) {
    return <Text>Failed to fetch data</Text>;
  }

  const handleValueChange = (newValue) => {
    const lanTemp = language;
    setIsFocus(false);
    setLanguage(newValue);
    updateProfileSF({
      id: profile?.id,
      field: 'language',
      value: newValue
    }, {
        onSuccess: () => {
          // console.log('handleValueChange success');
        },
        onError: () => {
          setLanguage(lanTemp);
          setIsFocus(true);
        }
      })
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          navigation.goBack();
        }}>
          <Feather name={"arrow-left"} size={36} />
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Text variant={'headlineLarge'}>Select Language</Text>
        <Dropdown
          style={[styles.dropdown]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={data}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select a language' : '...'}
          searchPlaceholder="Search..."
          value={language}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            handleValueChange(item.value);
          }}
          renderLeftIcon={() => (
            <Feather
              style={styles.icon}
              color={'black'}
              name="globe"
              size={20}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Languages;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 20
  },
  dropdown: {
    height: 50,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'gray',
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
