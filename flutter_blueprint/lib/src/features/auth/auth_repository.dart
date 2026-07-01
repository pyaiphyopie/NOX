import '../../../src/core/logger.dart';

abstract class AuthRepository {
  /// Signs the user in.
  ///
  /// Completes normally on success. Throws [AuthException] for invalid
  /// input or any unexpected failure — callers should catch [AuthException]
  /// to distinguish expected auth errors from programming errors.
  Future<void> signIn(String email, String password);
}

class AuthRepositoryImpl implements AuthRepository {
  @override
  Future<void> signIn(String email, String password) async {
    try {
      await Future<void>.delayed(const Duration(milliseconds: 400));
      if (email.isEmpty || password.isEmpty) {
        throw AuthException('Email and password must not be empty');
      }
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
