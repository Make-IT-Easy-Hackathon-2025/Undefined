class ProcessChaptersJob < ApplicationJob
  queue_as :default

  # A perform metódus kap egy job_id-t és a feldolgozandó szöveget (text)
  def perform(job_id, text)
    # 1) Daraboljuk a szöveget fejezetekre
    chapters_texts = ChapterSplitter.split(text)

    # 2) AI-feldolgozás (cím, összegzés, kérdések)
    results = chapters_texts.map do |chapter_text|
      {
        original_content: chapter_text,
        title: generate_title(chapter_text),
        ai_summary: generate_summary(chapter_text),
        generated_questions: generate_questions(chapter_text)
      }
    end

    # 3) Ha minden sikerült, küldünk egy "completed" üzenetet a websocketsre
    # ActionCable.server.broadcast(
   #    "processing_#{job_id}_channel",
   #    { status: "completed", data: results }
  #   )
  rescue StandardError => e
    # Hiba esetén jelzünk a frontnak
    #ActionCable.server.broadcast(
     # "processing_#{job_id}_channel",
    #  { status: "error", message: e.message }
    #)
  end

  private

  def generate_title(chapter_text)
    # Itt lehet bármilyen AI/ML vagy logika
    "AI által generált cím: #{chapter_text[0..20]}"
  end

  def generate_summary(chapter_text)
    # Itt jöhet az AI summarizer logikád
    "Összegzés (kivonat): #{chapter_text[0..50]}"
  end

  def generate_questions(chapter_text)
    # Kérdések generálása
    ["Kérdés #1?", "Kérdés #2?"]
  end
end
