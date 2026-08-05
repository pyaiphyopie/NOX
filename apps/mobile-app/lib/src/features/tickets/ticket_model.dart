enum TicketStatus { active, used, expired, transferred }

class DigitalTicket {
  final String id;
  final String eventId;
  final String eventTitle;
  final String venueName;
  final String tierName;
  final double price;
  final DateTime eventStart;
  final String qrPayload;
  final String userName;
  final TicketStatus status;
  final String? coverUrl;
  final String? seatInfo;

  const DigitalTicket({
    required this.id,
    required this.eventId,
    required this.eventTitle,
    required this.venueName,
    required this.tierName,
    required this.price,
    required this.eventStart,
    required this.qrPayload,
    required this.userName,
    required this.status,
    this.coverUrl,
    this.seatInfo,
  });

  bool get isActive => status == TicketStatus.active;
  bool get isUsable => status == TicketStatus.active;

  DigitalTicket copyWith({TicketStatus? status}) {
    return DigitalTicket(
      id: id,
      eventId: eventId,
      eventTitle: eventTitle,
      venueName: venueName,
      tierName: tierName,
      price: price,
      eventStart: eventStart,
      qrPayload: qrPayload,
      userName: userName,
      status: status ?? this.status,
      coverUrl: coverUrl,
      seatInfo: seatInfo,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'eventId': eventId,
        'eventTitle': eventTitle,
        'venueName': venueName,
        'tierName': tierName,
        'price': price,
        'eventStart': eventStart.toIso8601String(),
        'qrPayload': qrPayload,
        'userName': userName,
        'status': status.name,
        'coverUrl': coverUrl,
        'seatInfo': seatInfo,
      };

  factory DigitalTicket.fromJson(Map<String, dynamic> json) {
    return DigitalTicket(
      id: json['id'] as String,
      eventId: json['eventId'] as String,
      eventTitle: json['eventTitle'] as String,
      venueName: json['venueName'] as String,
      tierName: json['tierName'] as String,
      price: (json['price'] as num).toDouble(),
      eventStart: DateTime.parse(json['eventStart'] as String),
      qrPayload: json['qrPayload'] as String,
      userName: json['userName'] as String,
      status: TicketStatus.values.byName(json['status'] as String),
      coverUrl: json['coverUrl'] as String?,
      seatInfo: json['seatInfo'] as String?,
    );
  }
}
