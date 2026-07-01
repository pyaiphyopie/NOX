import '../../../src/core/logger.dart';

class HomeRepository {
  Future<List<String>> fetchDashboardItems() async {
    try {
      await Future<void>.delayed(const Duration(milliseconds: 300));
      return <String>['Welcome', 'Recent activity', 'Account status'];
    } catch (e, stack) {
      appLogger.e('Failed to fetch dashboard items',
          error: e, stackTrace: stack);
      rethrow;
    }
  }
}
