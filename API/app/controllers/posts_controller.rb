class PostsController < ApplicationController
  skip_before_action :require_authentication, only: [:index]
  def create
    post = Current.session.user.posts.build(post_params.except(:documents))

    if post.save
      if params[:documents].present?
        params[:documents].each do |uploaded_file|
          post.documents.create!(file: uploaded_file)
        end
      end

      ProcessPostDocumentsJob.perform_later(post.id)

      render json: post_response(post, Current.session.user), status: :created
    else
      render json: { error: post.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def index
    posts = Post.includes(:user, :likes, :dislikes, :comments)

    posts = posts.where(id: params[:id]) if params[:id].present?
    posts = posts.where(subject_id: params[:subject_id]) if params[:subject_id].present?
    posts = posts.search_by_title_and_description(params[:q]) if params[:q].present?

    render json: posts.to_a.map { |post| post_response(post, Current.session&.user) }
  end

  def files
    post = Post.find(params[:id])

    if params[:files].present?
      params[:files].each do |file|
        document = post.documents.create!(filename: file.original_filename)
        document.file.attach(file)
      end

      render json: {
        message: 'Fájl(ok) sikeresen feltöltve',
        post_id: post.id,
        documents: post.documents.map { |doc| { filename: doc.filename, url: url_for(doc.file) } }
      }, status: :ok
    else
      render json: { error: 'Nincs fájl feltöltve' }, status: :bad_request
    end
  end

  def process_files(post)
    processed_files = []

    post.documents.each do |document|
      processor = ChapterProcessor.new(document.file)
      chapters_data = processor.process

      chapters_data.each do |chapter_attrs|
        document.chapters.create!(chapter_attrs)
      end

      processed_files << { document_id: document.id, chapters: chapters_data }
    rescue StandardError => e
      Rails.logger.error "Hiba a fájl feldolgozásakor (document id: #{document.id}): #{e.message}"
      processed_files << { document_id: document.id, error: e.message }
    end

    processed_files
  end

  private

  def post_params
    params.permit(:title, :description, :content, :subject_id, documents: [])
  end

  def post_response(post, current_user)
    post_data = post.as_json
    post_data["subject_name"] = post.subject&.title
    {
      post: post_data,
      user: {
        id: post.user.id,
        email_address: post.user.email_address,
        firstname: post.user.firstname,
        lastname: post.user.lastname,
        avatar_url: post.user.avatar_url
      },
      likes_count: post.likes.count,
      dislikes_count: post.dislikes.count,
      comments_count: post.comments.count,
      liked_by_current_user: current_user ? post.likes.exists?(user_id: current_user.id) : false,
      disliked_by_current_user: current_user ? post.dislikes.exists?(user_id: current_user.id) : false,
      comments: post.comments.order(created_at: :asc).map do |comment|
        {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user: {
            id: comment.user.id,
            firstname: comment.user.firstname,
            lastname: comment.user.lastname,
            avatar_url: comment.user.avatar_url
          }
        }
      end,
      documents: post.documents.map do |document|
        {
          id: document.id,
          filename: document.file.attached? ? document.file.filename.to_s : nil,
          url: if document.file.attached?
                 Rails.application.routes.url_helpers.rails_blob_path(document.file,
                                                                      only_path: true)
               else
                 nil
               end
        }
      end
    }
  end
end
