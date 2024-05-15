import { StyleSheet, TouchableOpacity, ScrollView, View } from 'react-native';
import React, { useState } from 'react';
import CurrencyCard from '@/src/components/CurrencyItem';
import { currencyOptions } from '@/src/constants';

export const CurrencySelector = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {currencyOptions.map((co) => (
          <TouchableOpacity
            key={co.value}
            onPress={() => setSelectedCurrency(co.value)}
            style={styles.touchable}
          >
            <CurrencyCard
              currencyCode={co.value}
              currencySymbol={co.label}
              selected={co.value === selectedCurrency}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 120,
  },
  container: {
    marginHorizontal: 5,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
});

export default CurrencySelector;
