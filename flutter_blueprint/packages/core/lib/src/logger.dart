import 'dart:developer' as developer;

/// A simple logging utility for the NOX Flutter application.
class Logger {
  Logger._();

  /// Log a debug message
  static void debug(String message, {Object? error, StackTrace? stackTrace}) {
    developer.log('DEBUG: $message',
        name: 'NOX', error: error, stackTrace: stackTrace,);
  }

  /// Log an info message
  static void info(String message, {Object? error, StackTrace? stackTrace}) {
    developer.log('INFO: $message',
        name: 'NOX', error: error, stackTrace: stackTrace,);
  }

  /// Log a warning message
  static void warning(String message, {Object? error, StackTrace? stackTrace}) {
    developer.log('WARNING: $message',
        name: 'NOX', error: error, stackTrace: stackTrace,);
  }

  /// Log an error message
  static void error(String message, {Object? error, StackTrace? stackTrace}) {
    developer.log('ERROR: $message',
        name: 'NOX', error: error, stackTrace: stackTrace,);
  }

  /// Log a fatal error message
  static void fatal(String message, {Object? error, StackTrace? stackTrace}) {
    developer.log('FATAL: $message',
        name: 'NOX', error: error, stackTrace: stackTrace,);
  }
}