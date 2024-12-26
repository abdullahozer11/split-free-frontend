import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TextInput, Button } from "react-native-paper";
import { View } from "react-native";

const DebugTextInput = () => {
  const [queryKey, setQueryKey] = useState("");
  const queryClient = useQueryClient();

  const handleInvalidateQuery = async () => {
    if (queryKey) {
      await queryClient.invalidateQueries({ queryKey: [queryKey] });
    }
  };

  return (
    <View style={{ flexDirection: "row", width: "100%" }}>
      <TextInput
        placeholder="Enter query key"
        onChangeText={setQueryKey}
        value={queryKey}
        style={{ flex: 1 }}
      />
      <Button onPress={handleInvalidateQuery}>Invalidate</Button>
    </View>
  );
};

export default DebugTextInput;
