import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../home/event_model.dart';

class TicketPurchaseScreen extends StatelessWidget {
  final Event event;
  const TicketPurchaseScreen({super.key, required this.event});

  @override
  Widget build(BuildContext context) {
    final sold = ((event.attendance / event.capacity) * 100).round();
    return Scaffold(
      backgroundColor: const Color(0xFF070707),
      appBar: AppBar(
        title: const Text('Purchase Ticket'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: Image.network(
                event.coverUrl,
                height: 220,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              event.title,
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 4),
            Text(
              event.venue,
              style: const TextStyle(color: Color(0xFF00AEEF), fontSize: 16),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Capacity',
                  style: TextStyle(color: Colors.white54, fontSize: 13),
                ),
                Text(
                  '${event.attendance} / ${event.capacity}',
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: sold / 100,
                backgroundColor: Colors.white10,
                color: const Color(0xFF00AEEF),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '$sold% sold',
              style: const TextStyle(color: Colors.white38, fontSize: 12),
            ),
            const SizedBox(height: 28),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF141414),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white10),
              ),
              child: Column(
                children: [
                  const Text(
                    'DIGITAL TICKET',
                    style: TextStyle(
                      color: Color(0xFF00AEEF),
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 3,
                    ),
                  ),
                  const SizedBox(height: 20),
                  QrImageView(
                    data: 'NOX-${event.id.padLeft(6, '0')}',
                    size: 180,
                    backgroundColor: Colors.white,
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            event.timeLabel,
                            style: const TextStyle(
                              color: Colors.white54,
                              fontSize: 13,
                            ),
                          ),
                          Text(
                            '\$${event.price.toStringAsFixed(0)}',
                            style: const TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF00AEEF),
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00D68F).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'VALID',
                          style: TextStyle(
                            color: Color(0xFF00D68F),
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {},
              child: Text(
                'Purchase \u2014 \$${event.price.toStringAsFixed(0)}',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
