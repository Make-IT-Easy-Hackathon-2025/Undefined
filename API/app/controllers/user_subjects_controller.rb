class UserSubjectsController < ApplicationController
  before_action :set_subject, only: %i[join user_count]
  before_action :authenticate_user, only: %i[user_subjects join]

  def join
    user = Current.session.user
    if UserSubject.exists?(user: user, subject: @subject)
      render json: { error: 'Already joined' }, status: :unprocessable_entity
    else
      user.subjects << @subject
      render json: { message: 'Joined successfully' }, status: :ok
    end
  end

  def unsubscribe
    user = Current.session.user
    subject = Subject.find_by(id: params[:subject_id])

    return render json: { error: 'Subject not found' }, status: :not_found unless subject

    puts "User ID from token: #{user.id}"
    puts "Subject ID: #{subject.id}"

    user_subject = UserSubject.find_by(user: user, subject: subject)

    if user_subject
      puts 'UserSubject kapcsolat megtalálva, törlés indul...'
      user_subject.destroy
      render json: { message: 'Unsubscribed successfully' }, status: :ok
    else
      puts 'Nincs kapcsolat a user és a subject között!'
      render json: { error: 'Not subscribed to this subject' }, status: :unprocessable_entity
    end
  end

  def user_count
    render json: { subject_id: @subject.id, user_count: @subject.users.count }
  end

  def user_subjects
    render json: Current.session.user.subjects, status: :ok
  end

  private

  def set_subject
    @subject = Subject.find(params[:subject_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Subject not found' }, status: :not_found
  end

  def authenticate_user
    return if Current.session&.user

    render json: { error: 'Unauthorized' }, status: :unauthorized
  end
end
