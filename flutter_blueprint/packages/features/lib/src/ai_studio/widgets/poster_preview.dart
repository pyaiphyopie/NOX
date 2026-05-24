import 'package:flutter/material.dart';

class PosterPreview extends StatelessWidget {
  const PosterPreview({
    super.key,
    required this.imageUrl,
  });

  final String imageUrl;

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 4 / 5,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: const Color(0xFF101014),
            border: Border.all(color: Colors.pinkAccent.withOpacity(0.35)),
          ),
          child: Image.network(
            imageUrl,
            fit: BoxFit.cover,
            errorBuilder:
                (BuildContext context, Object error, StackTrace? stackTrace) {
              return const Center(
                child: Icon(
                  Icons.broken_image_outlined,
                  color: Colors.white54,
                  size: 42,
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
