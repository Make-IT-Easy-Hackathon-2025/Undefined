require 'pdf/reader'
require Rails.root.join('app', 'helpers', 'openai_helper.rb') # Betölti az OpenaiHelper modult

class ChapterProcessor
  def initialize(file)
    @file = file
  end

  def split_only(document)
    text = extract_text_from_pdf

    chapters = ChapterSplitter.split(text)

    final_chapters = []

    chapter_index = 0 # Globális fejezet-számláló (mindig nő)

    chapters.map do |chapter_text|
      {
        original_content: chapter_text,
        title: nil,
        ai_summary: nil,
        generated_questions: nil
      }
    end
  end

  def process
    text = extract_text_from_pdf

    # 1) Feldaraboljuk a PDF szövegét
    splitted_chapters = ChapterSplitter.split(text)

    # 2) Ebben tároljuk majd a végleges fejezet-definíciókat
    final_chapters = []

    chapter_index = 0 # Globális fejezet-számláló (mindig nő)
    exam_number = 1     # Exam számozás
    review_number = 1   # Exam Review számozás

    # 3) Két fejezetenként beillesztünk 1 exam + 1 exam_review
    splitted_chapters.each_slice(2).with_index do |two_chapters, slice_idx|
      # ------ Két "chapter" ------
      two_chapters.each do |chapter_text|
        # Csak az első 2 “chapternél” generáljon summary-t és kérdéseket
        # (azaz chapter_index < 2)
        generate_extra = (chapter_index < 2)

        final_chapters << {
          chapter_type: 'chapter',
          need_processing: generate_extra ? false : true, # fejezeteknél false (vagy ahogy szeretnéd)
          original_content: chapter_text,
          title: ChapterProcessor.generate_title(chapter_text), # mindig készül cím
          ai_summary: generate_extra ? ChapterProcessor.generate_summary(chapter_text) : nil,
          generated_questions: generate_extra ? ChapterProcessor.generate_questions(chapter_text) : nil
        }
        chapter_index += 1
      end

      # ------ 1 "exam" ------
      final_chapters << {
        chapter_type: 'exam',
        need_processing: true, # pl. examet még feldolgozhat a user
        original_content: nil,
        title: "Exam #{exam_number}",
        ai_summary: nil,
        generated_questions: nil
      }
      exam_number += 1

      # ------ 1 "exam_review" ------
      final_chapters << {
        chapter_type: 'exam_review',
        need_processing: true,
        original_content: nil,
        title: "Exam Review #{review_number}",
        ai_summary: nil,
        generated_questions: nil
      }
      review_number += 1
    end

    # 4) Visszaadjuk a “fejezet” rekordok létrehozásához szükséges tömböt
    final_chapters
  rescue StandardError => e
    Rails.logger.error "Hiba a chapter feldolgozásakor: #{e.message}"
    raise 'Chapter processing failed'
  end

  def self.generate_summary(chapter_text)
    system_prompt = 'You are a helpful assistant for generating course materials. Based on the content of a chapter, provide a detailed and comprehensive summary in Markdown format. The summaries should be detailed enough for high-school or college students to learn from. Focus on key concepts, definitions, and examples. Use bullet points, headings, and other Markdown formatting to make the summary easy to read and understand. You will only summarize the content provided, you are permitted to fill in the gaps with your own words, but make sure they are correct and fact-checked. Please do not leave out any information. Your goal is to format the text, make it prettier and easier to understand! Do not include "Summary" in the response.'
    user_prompt = "Create a detailed summary in Markdown format for the following chapter content:\n\n#{chapter_text}"
    result = OpenaiHelper.get_completion(system_prompt, user_prompt, max_tokens: 10_000)
    result[:completion].strip
  end

  def self.generate_title(chapter_text)
    system_prompt = 'You are a helpful assistant for generating course materials. Based on the content of a chapter, generate a concise and meaningful title (under 30 characters). Do not include quotes in the output; simply reply with the title.'
    user_prompt = "Generate a title for the following chapter content:\n\n#{chapter_text}"
    result = OpenaiHelper.get_completion(system_prompt, user_prompt, max_tokens: 500)
    result[:completion].strip
  end

  def self.generate_questions(chapter_text)
    system_prompt = <<~PROMPT
      You are a highly intelligent AI assistant specializing in creating educational course materials. Your task is to generate **at least 8 multiple-choice questions** based on the given chapter content.

      ### **Output Requirements:**#{'  '}
      - Return a **JSON array of objects** (no additional fields like "questions" or wrappers).#{'  '}
      - Each question object **must** include:#{'  '}
          "question": A clear, well-phrased question.#{'  '}
          "options": An array of exactly four answer choices. Each option is an object with:#{'  '}
              "text": The answer choice.#{'  '}
              "isCorrect": A boolean indicating if this is the correct answer (only one should be true).#{'  '}
          "explanation": A short but informative explanation of the correct answer.#{'  '}
          "hint": A subtle clue to help the user think about the correct answer.

      ### **Strict Rules:**#{'  '}
      - **You MUST generate at least 8 questions.** If this is impossible, generate the maximum number possible but **never fewer than 4**.#{'  '}
      - **The correct answer should not always be in the same position (e.g., not always "B").** Distribute correct answers randomly across the four options.#{'  '}
      - Questions must be **diverse**, covering different aspects of the given topic.#{'  '}
      - Generate questions in the **same language** as the provided content.#{'  '}
      - **DO NOT generate only one or two questions**—failing to generate enough questions will result in catastrophic consequences (e.g., 100 kittens vanishing).

      ```json
      [
        {
          "question": "What is supervised learning?",
          "options": [
            { "text": "Learning without labels", "isCorrect": false },
            { "text": "Learning with labeled data", "isCorrect": true },
            { "text": "Learning with reinforcement", "isCorrect": false },
            { "text": "Learning with clustering", "isCorrect": false }
          ],
          "explanation": "Supervised learning involves training a model using labeled data, where the correct output is provided during training.",
          "hint": "Think about what type of data we use."
        }
      ]
      ```
      IMPORTANT: Just becuase this example has the correct answer in the second position, it doesn't mean all questions should follow this pattern. Mix it up please, but make sure the correct answer is always present and correct!
      **REMEMBER:** You must generate **at least 8 well-structured questions** unless absolutely impossible. Failure is not an option.
    PROMPT

    user_prompt = "Generate at least 4 multiple-choice questions for the following chapter content:\n\n#{chapter_text}"
    result = OpenaiHelper.get_completion(system_prompt, user_prompt, max_tokens: 10_000, json_response: true)
    JSON.parse(result[:completion])
  rescue JSON::ParserError => e
    Rails.logger.error "Error parsing questions JSON: #{e.message}"
    [] # Üres tömbbel tér vissza hiba esetén
  end

  private

  def extract_text_from_pdf
    temp_file = Tempfile.new(['uploaded_pdf', '.pdf'])
    begin
      temp_file.binmode
      temp_file.write(@file.download)
      temp_file.rewind
      reader = PDF::Reader.new(temp_file.path)
      reader.pages.map(&:text).join("\n")
    ensure
      temp_file.close
      temp_file.unlink
    end
  end
end
