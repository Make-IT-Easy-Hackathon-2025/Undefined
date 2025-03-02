class ProcessChapterDataJob < ApplicationJob
  queue_as :default

  def perform(chapter_id)
    chapter = Chapter.find_by(id: chapter_id)
    return if chapter.nil? || !chapter.need_processing?

    # 🚀 Beállítjuk a feldolgozás állapotát
    chapter.update!(processing: true)

    # 🔥 Új thread indítása a feldolgozáshoz
    Thread.new do
      begin
        case chapter.chapter_type
        when "chapter"
          process_chapter(chapter)
        when "exam"
          process_exam(chapter)
        when "exam_review"
          process_exam_review(chapter)
        end
      rescue => e
        Rails.logger.error "❌ Hiba a feldolgozás során (Chapter ID: #{chapter.id}): #{e.message}"
      ensure
        chapter.update!(processing: false) # Feldolgozás befejezése
      end
    end
  end

  private

  def process_chapter(chapter)
    generated_title = ChapterProcessor.generate_title(chapter.original_content)
    generated_summary = ChapterProcessor.generate_summary(chapter.original_content)
    generated_questions = ChapterProcessor.generate_questions(chapter.original_content)

    chapter.update!(
      title: generated_title.presence || "Untitled Chapter",
      ai_summary: generated_summary.presence || "No summary available.",
      generated_questions: generated_questions.presence || [],
      need_processing: false
    )
    Rails.logger.info "✅ Chapter feldolgozva: #{chapter.id} - #{chapter.title}"
  rescue => e
    Rails.logger.error "❌ Hiba a chapter feldolgozásakor (ID: #{chapter.id}): #{e.message}"
  end

  def process_exam(chapter)
    last_exam = Chapter.where(document_id: chapter.document_id, chapter_type: "exam").order(:id).last
    last_exam_number = last_exam&.title&.scan(/\d+/)&.first&.to_i || 0
    new_exam_number = last_exam_number + 1

    chapters_for_exam = Chapter.where(document_id: chapter.document_id, chapter_type: "chapter")
                               .order("id DESC")
                               .limit(2)

    combined_content = chapters_for_exam.map(&:original_content).join("\n---\n")
    exam_questions = ChapterProcessor.generate_questions(combined_content)

    chapter.update!(
      title: "Exam",
      generated_questions: exam_questions,
      need_processing: false
    )
    Rails.logger.info "✅ Exam feldolgozva: #{chapter.id} - #{chapter.title}"
  rescue => e
    Rails.logger.error "❌ Hiba az exam feldolgozásakor (ID: #{chapter.id}): #{e.message}"
  end

  def process_exam_review(chapter)
    exam_chapter = Chapter.where(document_id: chapter.document_id, chapter_type: "exam").order("id DESC").first
    unless exam_chapter
      Rails.logger.error "❌ Exam Review feldolgozás sikertelen: nincs megfelelő Exam fejezet!"
      return
    end
  
    last_submission = ExamSubmission.where(exam_id: exam_chapter.id).order("created_at DESC").first
    unless last_submission
      Rails.logger.error "❌ Exam Review feldolgozás sikertelen: nincs beküldött vizsga válasz!"
      chapter.update!(need_processing: false, ai_summary: "No exam submission available.")
      return
    end
  
    unless exam_chapter.generated_questions && exam_chapter.generated_questions["questions"]
      Rails.logger.error "❌ Exam Review sikertelen: nincs generált kérdés az Exam-hoz!"
      chapter.update!(need_processing: false, ai_summary: "No generated questions available.")
      return
    end
  
    # 📌 Kiértékeljük a felhasználó válaszait
    review_results = last_submission.answers.map do |answer|
      question_data = exam_chapter.generated_questions["questions"][answer["questionId"].to_i % exam_chapter.generated_questions["questions"].length]
      
      next unless question_data # Ha nincs kérdés, lépjen tovább
  
      # 🔍 A felhasználó által választott válasz keresése
      user_option = question_data["options"].find { |opt| opt["text"].hash == answer["selectedOptionId"] }
      correct_option = question_data["options"].find { |opt| opt["isCorrect"] == true }
  
      {
        question: question_data["question"],
        user_answer: user_option ? user_option["text"] : "N/A",
        correct_answer: correct_option ? correct_option["text"] : "N/A",
        is_correct: user_option && correct_option && user_option["text"] == correct_option["text"]
      }
    end.compact
  
    chapter.update!(
      title: "Exam Review",
      ai_summary: "A válaszok kiértékelése az alábbi eredménnyel zárult.",
      generated_questions: { review: review_results },
      need_processing: false
    )
  
    Rails.logger.info "✅ Exam Review feldolgozva: #{chapter.id} - #{chapter.title}"
  rescue => e
    Rails.logger.error "❌ Hiba az Exam Review feldolgozásakor (ID: #{chapter.id}): #{e.message}"
  end
  
  
end
