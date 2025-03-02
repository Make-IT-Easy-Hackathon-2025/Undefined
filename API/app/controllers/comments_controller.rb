class CommentsController < ApplicationController
  before_action :require_authentication

  def create
    post = Post.find(params[:post_id])
    comment = post.comments.build(user: Current.session.user, content: params[:content])

    if comment.save
      render json: { message: 'Hozzászólás létrehozva', comment: comment }, status: :created
    else
      render json: { error: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    comment = Comment.find_by(id: params[:id], user: Current.session.user)

    if comment
      comment.destroy
      render json: { message: 'Hozzászólás törölve' }, status: :ok
    else
      render json: { error: 'Nem található hozzászólás' }, status: :not_found
    end
  end

  def index
    comments = if params[:id].present?
                 Comment.where(id: params[:id])
               elsif params[:post_id].present?
                 Comment.where(post_id: params[:post_id])
               else
                 Comment.all
               end

    render json: comments
  end
end
