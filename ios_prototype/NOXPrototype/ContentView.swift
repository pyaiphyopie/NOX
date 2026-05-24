import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            DiscoverView()
                .tabItem {
                    Label("Discover", systemImage: "sparkles")
                }

            TicketsView()
                .tabItem {
                    Label("Tickets", systemImage: "ticket.fill")
                }

            StudioView()
                .tabItem {
                    Label("Studio", systemImage: "wand.and.stars")
                }

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.crop.circle")
                }
        }
        .tint(.cyan)
        .preferredColorScheme(.dark)
    }
}

private struct DiscoverView: View {
    private let events = Event.sample

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    HeroPanel()

                    SectionHeader(title: "Tonight's Pulse", action: "View all")

                    VStack(spacing: 14) {
                        ForEach(events) { event in
                            EventCard(event: event)
                        }
                    }

                    SectionHeader(title: "Operator Tools", action: "Open")

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        MetricTile(value: "300+", label: "Events")
                        MetricTile(value: "50+", label: "Promoters")
                        MetricTile(value: "20+", label: "Venues")
                        MetricTile(value: "4.8", label: "Guest rating")
                    }
                }
                .padding(20)
            }
            .background(NOXBackground())
            .navigationTitle("NOX")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                    } label: {
                        Image(systemName: "bell.badge")
                    }
                    .accessibilityLabel("Notifications")
                }
            }
        }
    }
}

private struct HeroPanel: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            Label("Yangon Beta Launch", systemImage: "location.fill")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.cyan)

            Text("Own the night")
                .font(.system(size: 42, weight: .black, design: .rounded))
                .textCase(.uppercase)

            Text("Discover events, secure tickets, and power the next generation of nightlife operations across ASEAN cities.")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.72))
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: 12) {
                Button("Explore Events") {
                }
                .buttonStyle(PrimaryNeonButtonStyle())

                Button("View Demo") {
                }
                .buttonStyle(SecondaryNeonButtonStyle())
            }
        }
        .padding(22)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [
                    Color.cyan.opacity(0.24),
                    Color.purple.opacity(0.18),
                    Color.white.opacity(0.05),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(.white.opacity(0.14))
        )
    }
}

private struct EventCard: View {
    let event: Event

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                LinearGradient(
                    colors: event.gradient,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                Image(systemName: event.icon)
                    .font(.system(size: 30, weight: .bold))
                    .foregroundStyle(.white)
            }
            .frame(width: 88, height: 104)
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

            VStack(alignment: .leading, spacing: 8) {
                Text(event.title)
                    .font(.headline.weight(.black))

                Text(event.venue)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.cyan)

                Text(event.genre)
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.62))

                HStack {
                    Text(event.time)
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.52))

                    Spacer()

                    Text(event.price)
                        .font(.caption.weight(.black))
                        .foregroundStyle(.black)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(.cyan)
                        .clipShape(Capsule())
                }
            }
        }
        .padding(12)
        .background(Color.white.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(.white.opacity(0.1))
        )
    }
}

private struct TicketsView: View {
    var body: some View {
        NavigationStack {
            List {
                TicketRow(title: "NEON DISTRICT", venue: "Warehouse 19", status: "Ready")
                TicketRow(title: "AFTERHOURS", venue: "NOIR Rooftop", status: "Pending")
            }
            .scrollContentBackground(.hidden)
            .background(NOXBackground())
            .navigationTitle("Tickets")
        }
    }
}

private struct TicketRow: View {
    let title: String
    let venue: String
    let status: String

    var body: some View {
        HStack {
            Image(systemName: "qrcode")
                .font(.title)
                .foregroundStyle(.cyan)

            VStack(alignment: .leading) {
                Text(title)
                    .font(.headline.weight(.black))
                Text(venue)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text(status)
                .font(.caption.weight(.semibold))
                .foregroundStyle(status == "Ready" ? .green : .yellow)
        }
        .listRowBackground(Color.white.opacity(0.06))
    }
}

private struct StudioView: View {
    private let tools = [
        StudioTool(title: "AI Music", icon: "music.note", tint: Color.cyan),
        StudioTool(title: "Voiceover", icon: "waveform", tint: Color.green),
        StudioTool(title: "Poster", icon: "photo", tint: Color.pink),
        StudioTool(title: "Copywriting", icon: "text.bubble", tint: Color.orange),
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 14) {
                    ForEach(tools) { tool in
                        StudioToolCard(tool: tool)
                    }
                }
                .padding(20)
            }
            .background(NOXBackground())
            .navigationTitle("AI Studio")
        }
    }
}

private struct StudioToolCard: View {
    let tool: StudioTool

    var body: some View {
        VStack(spacing: 14) {
            Image(systemName: tool.icon)
                .font(.system(size: 34, weight: .bold))
                .foregroundStyle(tool.tint)

            Text(tool.title)
                .font(.headline.weight(.bold))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, minHeight: 132)
        .background(Color.white.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .stroke(tool.tint.opacity(0.35))
        )
    }
}

private struct ProfileView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 18) {
                Image(systemName: "person.crop.circle.fill")
                    .font(.system(size: 76))
                    .foregroundStyle(.cyan)

                Text("Promoter Mode")
                    .font(.title2.weight(.black))

                Text("Track event performance, guestlists, and AI-generated campaign assets from one mobile command center.")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.65))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                Button("Open Dashboard") {
                }
                .buttonStyle(PrimaryNeonButtonStyle())
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(NOXBackground())
            .navigationTitle("Profile")
        }
    }
}

private struct SectionHeader: View {
    let title: String
    let action: String

    var body: some View {
        HStack {
            Text(title)
                .font(.title3.weight(.black))

            Spacer()

            Button(action) {
            }
            .font(.caption.weight(.bold))
            .foregroundStyle(.cyan)
        }
    }
}

private struct MetricTile: View {
    let value: String
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(value)
                .font(.title.weight(.black))
                .foregroundStyle(.cyan)
            Text(label)
                .font(.caption)
                .foregroundStyle(.white.opacity(0.64))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color.white.opacity(0.06))
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct NOXBackground: View {
    var body: some View {
        LinearGradient(
            colors: [
                Color.black,
                Color(red: 0.02, green: 0.03, blue: 0.07),
                Color.black,
            ],
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()
    }
}

private struct PrimaryNeonButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.black))
            .foregroundStyle(.black)
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(configuration.isPressed ? Color.cyan.opacity(0.72) : Color.cyan)
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct SecondaryNeonButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.subheadline.weight(.bold))
            .foregroundStyle(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(configuration.isPressed ? Color.white.opacity(0.14) : Color.white.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .stroke(.white.opacity(0.16))
            )
    }
}

private struct Event: Identifiable {
    let id = UUID()
    let title: String
    let venue: String
    let genre: String
    let time: String
    let price: String
    let icon: String
    let gradient: [Color]

    static let sample = [
        Event(
            title: "NEON DISTRICT",
            venue: "Warehouse 19",
            genre: "Techno / Underground",
            time: "Tonight 11:00 PM",
            price: "$12",
            icon: "bolt.fill",
            gradient: [Color.cyan, Color.purple]
        ),
        Event(
            title: "AFTERHOURS",
            venue: "NOIR Rooftop",
            genre: "Hip-Hop / Trap",
            time: "Friday 10:30 PM",
            price: "$18",
            icon: "moon.stars.fill",
            gradient: [Color.pink, Color.orange]
        ),
        Event(
            title: "RIVER SIGNAL",
            venue: "Portside Stage",
            genre: "Afrobeat / House",
            time: "Saturday 9:00 PM",
            price: "$15",
            icon: "dot.radiowaves.left.and.right",
            gradient: [Color.green, Color.blue]
        ),
    ]
}

private struct StudioTool: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    let tint: Color
}

#Preview {
    ContentView()
}
