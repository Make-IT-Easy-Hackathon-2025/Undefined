class DislikesController < ApplicationController
  before_action :require_authentication

  def create
    post = Post.find(params[:post_id])
    dislike = post.dislikes.build(user: Current.session.user)

    if dislike.save
      render json: { message: 'Poszt dislike-olva' }, status: :created
    else
      render json: { error: dislike.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    dislike = Dislike.find_by(post_id: params[:post_id], user_id: Current.session.user.id)

    if dislike
      dislike.destroy
      render json: { message: 'Disike eltávolítva' }, status: :ok
    else
      render json: { error: 'Nem található dislike' }, status: :not_found
    end
  end

  def index
    dislikes = if params[:id].present?
                 Dislike.where(id: params[:id])
               elsif params[:post_id].present?
                 Dislike.where(post_id: params[:post_id])
               else
                 Dislike.all
               end

    render json: dislikes
  end
end
