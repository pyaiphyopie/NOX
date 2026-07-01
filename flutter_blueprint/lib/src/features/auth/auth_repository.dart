import '../../../src/core/logger.dart';

abstract class AuthRepository {
  Future<bool> signIn(String email, String password);
}

class AuthRepositoryImpl implements AuthRepository {
  @override
  Future<bool> signIn(String email, String password) async {
    try {
      await Future<void>.delayed(const Duration(milliseconds: 400));
      if (email.isEmpty || password.isEmpty) {
        throw AuthException('Email and password must not be empty');
      }
      return true;
    } on AuthException {
      rethrow;
    } catch (e, stack) {
      appLogger.e('Sign-in failed', error: e, stackTrace: stack);
      throw AuthException('Sign-in failed: $e');
    }
  }
}

class AuthException implements Exception {
  final String message;
  const AuthException(this.message);

  @override
  String toString() => 'AuthException: $message';
}
