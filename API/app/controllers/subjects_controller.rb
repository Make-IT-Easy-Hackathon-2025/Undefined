class SubjectsController < ApplicationController
  def create
    subject = Subject.new(subject_params)

    if subject.save
      render json: subject, status: :created
    else
      render json: { errors: subject.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def index
    user = Current.session.user

    subjects = if params[:id].present?
                 Subject.where(id: params[:id])
               elsif params[:q].present?
                 Subject.search_by_title(params[:q])
               else
                 Subject.all
               end

    subjects_with_subscription = subjects.map do |subject|
      is_subscribed = user.present? && UserSubject.exists?(user_id: user.id, subject_id: subject.id)

      {
        id: subject.id,
        title: subject.title,
        year: subject.year,
        created_at: subject.created_at,
        updated_at: subject.updated_at,
        is_subscribed: is_subscribed
      }
    end

    render json: subjects_with_subscription
  end

  private

  def subject_params
    params.require(:subject).permit(:title, :year)
  end
end
