class LikesController < ApplicationController
  before_action :require_authentication

  def create
    post = Post.find(params[:post_id])
    like = post.likes.build(user: Current.session.user)

    if like.save
      render json: { message: 'Poszt like-olva' }, status: :created
    else
      render json: { error: like.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    like = Like.find_by(post_id: params[:post_id], user_id: Current.session.user.id)

    if like
      like.destroy
      render json: { message: 'Like eltávolítva' }, status: :ok
    else
      render json: { error: 'Nem található like' }, status: :not_found
    end
  end

  def index
    likes = if params[:id].present?
              Like.where(id: params[:id])
            elsif params[:post_id].present?
              Like.where(post_id: params[:post_id])
            else
              Like.all
            end

    puts "Likes: #{likes.count}"

    render json: likes
  end
end
