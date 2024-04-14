import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from "@/src/components/Themed";

const CurrencyCard = ({ currencyCode, currencySymbol, selected }) => {
  return (
    <View style={[styles.card, selected && styles.selectedCard]}>
      <View />
      <View style={[styles.symbolBubble, selected && styles.selectedSymbolBubble]}>
        <Text style={[styles.currencySymbol, selected && styles.selectedText]}>{currencySymbol}</Text>
      </View>
      <Text style={[styles.currencyCode, selected && styles.selectedCode]}>{currencyCode}</Text>
    </View>
  );
};

export default CurrencyCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    marginHorizontal: 5,
    borderRadius: 10,
    height: 100,
    width: 100,
    alignItems: 'center',
    justifyContent: "space-between",
  },
  selectedCard: {
    backgroundColor: 'black',
  },
  symbolBubble: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 7,
  },
  selectedSymbolBubble: {
    backgroundColor: 'white',
  },
  currencyCode: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: 'black',
  },
  selectedText: {
    color: 'black',
  },
  selectedCode: {
    color: 'white',
  }
});
