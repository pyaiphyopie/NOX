class HomeRepository {
  Future<List<String>> fetchDashboardItems() async {
    await Future<void>.delayed(const Duration(milliseconds: 300));
    return <String>['Welcome', 'Recent activity', 'Account status'];
  }
}
