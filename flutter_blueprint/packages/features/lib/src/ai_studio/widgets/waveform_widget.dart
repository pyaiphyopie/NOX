import 'package:flutter/material.dart';

class WaveformWidget extends StatelessWidget {
  const WaveformWidget({
    super.key,
    this.color = Colors.cyanAccent,
  });

  final Color color;

  static const List<double> _bars = <double>[
    0.25,
    0.55,
    0.4,
    0.8,
    0.35,
    0.7,
    0.5,
    0.9,
    0.45,
    0.65,
    0.3,
    0.75,
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 56,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: _bars
            .map(
              (double heightFactor) => Expanded(
                child: Align(
                  alignment: Alignment.center,
                  child: FractionallySizedBox(
                    heightFactor: heightFactor,
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.85),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
              ),
            )
            .toList(growable: false),
      ),
    );
  }
}
