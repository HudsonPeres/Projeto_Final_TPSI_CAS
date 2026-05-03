import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = 28,
  onRatingChange,
}) {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    const filled = i <= rating;
    stars.push(
      <TouchableOpacity
        key={i}
        onPress={() => onRatingChange && onRatingChange(i)}
        disabled={!onRatingChange}
        activeOpacity={0.6}
      >
        <Text
          style={[
            styles.star,
            { fontSize: size },
            filled ? styles.filled : styles.empty,
          ]}
        >
          ★
        </Text>
      </TouchableOpacity>,
    );
  }
  return <View style={styles.container}>{stars}</View>;
}

const styles = StyleSheet.create({
  container: { flexDirection: "row" },
  star: { marginHorizontal: 2 },
  filled: { color: "#FFD700" },
  empty: { color: "#ccc" },
});
