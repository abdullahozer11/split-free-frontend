import React from "react";
import { Redirect } from "expo-router";

const index = () => {
  return <Redirect href={"/(tabs)/group"} />;
};

export default index;
