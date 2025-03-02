class ChaptersController < ApplicationController
  def generate_data
    doc_id = params[:document_id]
    chapter_id = params[:id]

    document = Document.find(doc_id)

    chapter = document.chapters.find(chapter_id)

    if !chapter.need_processing? || chapter.ai_summary.present? || chapter.generated_questions.present?
      return render json: {
        error: 'Ez a fejezet már feldolgozottnak tűnik.'
      }, status: :unprocessable_entity
    end

    if chapter.processing
      return render json: {
        error: 'Ez a fejezet már feldolgozás alatt áll.'
      }, status: :unprocessable_entity
    end

    chapter.update!(processing: true)


    ProcessChapterDataJob.perform_later(chapter.id)

    render json: { message: 'Fejezet feldolgozása elindítva háttérben.', chapter_id: chapter.id }
  end

  def titles
    doc_id = params[:document_id]

    document = Document.find(doc_id)
    chapters = document.chapters.order(:id)

    titles = chapters.map { |chapter| { id: chapter.id, title: chapter.title, type: chapter.chapter_type } }

    render json: { document_id: doc_id, titles: titles }
  end

  def document_chapters
    doc_id = params[:document_id]

    document = Document.find(doc_id)
    chapters = document.chapters.order(:id)

    render json: {
      document_id: doc_id,
      chapters: chapters.map do |chapter|
        {
          id: chapter.id,
          chapter_type: chapter.chapter_type,
          need_processing: chapter.need_processing,
          title: chapter.title,
          original_content: chapter.original_content,
          ai_summary: chapter.ai_summary,
          generated_questions: chapter.generated_questions
        }
      end
    }
  end
end
