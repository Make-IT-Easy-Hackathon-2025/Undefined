# app/jobs/process_post_documents_job.rb
class ProcessPostDocumentsJob < ApplicationJob
  queue_as :default

  def perform(post_id)
    post = Post.find(post_id)

    # Végigmegyünk a posthoz tartozó dokumentumokon
    post.documents.each do |document|
      begin
        processor = ChapterProcessor.new(document.file)
        chapters_data = processor.process

        # Létrehozzuk a chapter-eket a kapott eredmények alapján
        chapters_data.each do |chapter_attrs|
          document.chapters.create!(chapter_attrs)
        end
      rescue => e
        Rails.logger.error "Hiba a fájl feldolgozásakor (document id: #{document.id}): #{e.message}"
      end
    end

    # Ha minden dokumentum feldolgozása befejeződött, broadcastolunk
   # ActionCable.server.broadcast(
   #   "processing_post_#{post_id}_channel",
   #   status: "completed",
   #   post_id: post_id
   # )
  end
end
