import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'event_model.dart';

final eventRepositoryProvider = Provider<EventRepository>((ref) {
  return EventRepository();
});

class EventRepository {
  Future<List<Event>> fetchDiscover() async {
    // TODO: Supabase.from('events').select().order('start_at')
    await Future.delayed(const Duration(milliseconds: 300));
    return mockEvents;
  }

  Future<Event?> fetchById(String id) async {
    await Future.delayed(const Duration(milliseconds: 200));
    try {
      return mockEvents.firstWhere((e) => e.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<List<Event>> fetchTonight() async {
    final all = await fetchDiscover();
    return all.where((e) => e.isTonight).toList();
  }

  Future<List<Event>> fetchTrending() async {
    final all = await fetchDiscover();
    return all.where((e) => e.isTrending).toList();
  }
}

final discoverEventsProvider = FutureProvider<List<Event>>((ref) {
  return ref.watch(eventRepositoryProvider).fetchDiscover();
});

final eventDetailProvider = FutureProvider.family<Event?, String>((ref, id) {
  return ref.watch(eventRepositoryProvider).fetchById(id);
});
