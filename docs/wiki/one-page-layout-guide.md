Lets build the Motivations section in the app. Every day at UTC 12 AM, we generate a new “Motivations of the Day” using the Google Gemini API.
Users can either keep the AI-generated quote or:
1. Reshuffle (ask AI for a new quote) → only 2 reshuffles allowed per day
2. Add their own quote → stored in DB with quote + author
- Author defaults to the user’s username
- User can edit the author field

Requirements & Logic:

Daily Auto-Generation
- At UTC 00:00, trigger backend cron job, we can use free github actions
- Send request to Gemini API to generate a pump-up motivation quote, using the "Motivations Prompt". 
- 
- Store this in the Motivations table

Reshuffle Logic (AI Regeneration)
	•	User can reshuffle max 2 times per day
	•	Before reshuffling, show a modal asking user for their mood
	•	Mood input: text field with preset chips (e.g., “Pump up”, “Happy”, “Calm”, “Focused”, etc.)
	•	Store mood as a comma-separated list
	•	Hit the same Gemini API
	•	Store the new quote in DB
	•	Deduct 1 reshuffle count for the day

User-Added Quote
	•	User taps “Add Motivation”
	•	Form fields:
	•	quote: string
	•	author: string (default = username, editable)
	•	Save into Motivations table
	•	Mark as user_generated = true

UI Buttons (Design Improvement Required)
Instead of two dull buttons, implement:
	•	Primary Action: “AI Reshuffle” (animated refresh icon + label)
	•	Secondary Action: “Add Your Own” (small subtle “+ Add” button near the header)
	•	Alternatively, use a 3-dot menu for extra actions
Goal: Make it visually clean and non-intrusive.

⸻

APIs to Build
	1.	POST /motivation/auto-generate (cron job)
	2.	POST /motivation/reshuffle (mood input required)
	3.	POST /motivation/add (custom quote)
	4.	GET /motivation/today (returns final quote of the day)

⸻

DB Structure Suggestion

Motivations {
  id                UUID
  user_id           UUID
  quote             TEXT
  author            VARCHAR
  mood              TEXT         // comma-separated mood input
  source            ENUM('AI', 'USER')
  reshuffle_count   INTEGER      // track remaining reshuffles
  date              DATE
  created_at        TIMESTAMP
}

