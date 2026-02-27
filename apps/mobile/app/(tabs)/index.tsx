import React from 'react';
import { StyleSheet, FlatList, View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { TrainingItem } from '../../src/components/TrainingItem';
import { Skeleton } from '../../src/components/Skeleton';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];
  const router = useRouter();

  const { data: events, isLoading } = useQuery({
    queryKey: ['my-events'],
    queryFn: async () => {
      // For now returning mock data since API might not be reachable yet or needs clerk token
      return [
        {
          id: '1',
          title: 'Treino de Velocidade',
          startTime: new Date().toISOString(),
          locationName: 'Pista de Atletismo Ibirapuera',
          visibility: 'PUBLIC',
          participantCount: 12,
        },
        {
          id: '2',
          title: 'Yoga ao Amanhecer',
          startTime: new Date(Date.now() + 86400000).toISOString(),
          locationName: 'Praça Por-do-Sol',
          visibility: 'FRIENDS',
          participantCount: 5,
        }
      ];
    }
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.greeting, { color: colors.tabIconDefault }]}>Bom dia,</Text>
      <Text style={[styles.name, { color: colors.text }]}>Pronto para o play? 🔥</Text>

      <View style={styles.dateSelector}>
        <Text style={[styles.today, { color: colors.primary }]}>Hoje</Text>
        <Text style={[styles.dateText, { color: colors.text }]}>
          {format(new Date(), "eeee, d 'de' MMMM", { locale: ptBR })}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ padding: 24 }}>
          <Skeleton width="60%" height={30} style={{ marginBottom: 10 }} />
          <Skeleton width="40%" height={20} style={{ marginBottom: 30 }} />
          <Skeleton width="100%" height={150} borderRadius={24} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={150} borderRadius={24} style={{ marginBottom: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrainingItem
            training={item}
            onPress={() => router.push(`/event/${item.id}`)}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
              Nenhum treino agendado para hoje.
            </Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/create')}
      >
        <Plus color="#000" size={32} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  dateSelector: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  today: {
    fontSize: 18,
    fontWeight: '900',
    backgroundColor: '#ADFF2F20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ADFF2F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  }
});
