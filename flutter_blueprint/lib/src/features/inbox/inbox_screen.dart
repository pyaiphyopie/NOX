import 'package:flutter/material.dart';

class InboxScreen extends StatelessWidget {
  const InboxScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070707),
      appBar: AppBar(
        title: const Text('Inbox'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _messageCard(
            'NEON DISTRICT Tonight!',
            'Your ticket is ready. Doors open at 10 PM at Warehouse 19.',
            '2h ago',
            true,
          ),
          _messageCard(
            'Promoter Update',
            'ELECTRIC MONSOON added a special guest. Check the updated lineup.',
            '1d ago',
            false,
          ),
          _messageCard(
            'Welcome to NOX',
            'Discover what the city feels tonight. Your Beta Insider access is live.',
            '3d ago',
            false,
          ),
        ],
      ),
    );
  }

  Widget _messageCard(String title, String body, String time, bool unread) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: unread
            ? const Color(0xFF00AEEF).withValues(alpha: 0.08)
            : const Color(0xFF141414),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: unread
              ? const Color(0xFF00AEEF).withValues(alpha: 0.3)
              : Colors.white10,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (unread)
            Container(
              width: 8,
              height: 8,
              margin: const EdgeInsets.only(top: 6, right: 12),
              decoration: const BoxDecoration(
                color: Color(0xFF00AEEF),
                shape: BoxShape.circle,
              ),
            )
          else
            const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontWeight: unread ? FontWeight.w700 : FontWeight.w500,
                        fontSize: 15,
                      ),
                    ),
                    Text(
                      time,
                      style: const TextStyle(color: Colors.white38, fontSize: 12),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  body,
                  style: const TextStyle(
                    color: Colors.white54,
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
