import 'package:flutter/material.dart';

class BottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const BottomNav({super.key, required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF070707),
        border: Border(top: BorderSide(color: Colors.white10)),
      ),
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: onTap,
        backgroundColor: Colors.transparent,
        elevation: 0,
        selectedItemColor: const Color(0xFF00AEEF),
        unselectedItemColor: const Color(0xFFA1A1AA),
        type: BottomNavigationBarType.fixed,
        selectedFontSize: 11,
        unselectedFontSize: 11,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.explore_outlined), activeIcon: Icon(Icons.explore), label: 'Discover'),
          BottomNavigationBarItem(icon: Icon(Icons.confirmation_number_outlined), activeIcon: Icon(Icons.confirmation_number), label: 'Tickets'),
          BottomNavigationBarItem(icon: Icon(Icons.whatshot_outlined), activeIcon: Icon(Icons.whatshot), label: 'Pulse'),
          BottomNavigationBarItem(icon: Icon(Icons.mail_outlined), activeIcon: Icon(Icons.mail), label: 'Inbox'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
