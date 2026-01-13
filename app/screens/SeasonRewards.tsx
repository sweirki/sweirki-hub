import React from "react";
import { View, Text, TouchableOpacity, Image, FlatList } from "react-native";
import { useSeasonRewardsStore } from "../stores/useSeasonRewardsStore";

export default function SeasonRewardsScreen() {
  const { unclaimed, markClaimed } = useSeasonRewardsStore();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Season Rewards
      </Text>

      {unclaimed.length === 0 && (
        <Text style={{ fontSize: 18 }}>No rewards unlocked yet.</Text>
      )}

      <FlatList
        data={unclaimed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              backgroundColor: "#222",
              marginBottom: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 20, color: "white" }}>
              Reward: {item.type}
            </Text>
            <Text style={{ fontSize: 14, color: "#aaa" }}>
              XP Required: {item.xpRequired}
            </Text>

            <TouchableOpacity
              onPress={() => markClaimed(item.id)}
              style={{
                backgroundColor: "gold",
                padding: 10,
                marginTop: 10,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                CLAIM
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
