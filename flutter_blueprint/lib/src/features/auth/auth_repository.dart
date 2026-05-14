abstract class AuthRepository {
  Future<bool> signIn(String email, String password);
}

class AuthRepositoryImpl implements AuthRepository {
  @override
  Future<bool> signIn(String email, String password) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    return email.isNotEmpty && password.isNotEmpty;
  }
}
