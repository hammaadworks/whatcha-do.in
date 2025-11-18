export default function DashboardPage() {
  console.log("DashboardPage: Rendering.");
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-[var(--font-size-3xl)] font-bold mb-4">Dashboard</h1>

      {/* Desktop and large screens layout */}
      <div className="hidden lg:grid lg:grid-cols-4 lg:gap-4">
        <div className="lg:col-span-4 bg-card p-4 rounded-lg" data-testid="bio-section">
          Your Bio Here
        </div>
        <div className="lg:col-span-4 bg-card p-4 rounded-lg" data-testid="todos-section">
          Your Todos Here
        </div>
        <div className="lg:col-span-2 bg-card p-4 rounded-lg" data-testid="today-section">
          Today's Habits
        </div>
        <div className="lg:col-span-2 bg-card p-4 rounded-lg" data-testid="yesterday-section">
          Yesterday's Habits
        </div>
        <div className="lg:col-span-4 bg-card p-4 rounded-lg" data-testid="the-pile-section">
          The Pile
        </div>
        <div className="lg:col-span-4 bg-card p-4 rounded-lg" data-testid="journal-section">
          Journal
        </div>
        <div className="lg:col-span-4 bg-card p-4 rounded-lg" data-testid="footer-section">
          Footer
        </div>
      </div>

      {/* Mobile and medium screens layout */}
      <div className="lg:hidden flex flex-col gap-4">
        <div className="bg-card p-4 rounded-lg" data-testid="bio-section-mobile">
          Your Bio Here (Mobile)
        </div>
        <div className="bg-card p-4 rounded-lg" data-testid="todos-section-mobile">
          Your Todos Here (Mobile)
        </div>
        <div className="bg-card p-4 rounded-lg" data-testid="today-section-mobile">
          Today's Habits (Mobile)
        </div>
        <div className="bg-card p-4 rounded-lg" data-testid="yesterday-section-mobile">
          Yesterday's Habits (Mobile)
        </div>
        <div className="bg-card p-4 rounded-lg" data-testid="the-pile-section-mobile">
          The Pile (Mobile)
        </div>
        <div className="bg-card p-4 rounded-lg" data-testid="journal-section-mobile">
          Journal (Mobile)
        </div>
        <div className="bg-card p-4 rounded-lg" data-testid="footer-section-mobile">
          Footer (Mobile)
        </div>
      </div>
    </div>
  );
}
