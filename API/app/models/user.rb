class User < ApplicationRecord
  has_secure_password
  has_many :posts, dependent: :destroy
  has_many :sessions, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :dislikes, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :user_subjects, dependent: :destroy
  has_many :subjects, through: :user_subjects

  has_one_attached :avatar
  after_create :attach_default_avatar

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  validates :role, inclusion: { in: %w[user admin] }

  def admin?
    role == "admin"
  end

  def avatar_url
    if avatar.attached?
      Rails.application.routes.url_helpers.rails_blob_url(avatar, only_path: true)
    else
      "/default_avatar.png"
    end
  end
  
  
  private

  def attach_default_avatar
    return if avatar.attached? 
  
    default_avatar = default_avatar_blob
    return unless default_avatar 
  
    avatar.attach(
      io: StringIO.new(default_avatar.download),
      filename: "default_avatar.png",
      content_type: "image/png"
    )
  end
  

  def default_avatar_blob
    ActiveStorage::Blob.where(filename: "default_avatar.png").order(created_at: :desc).first
  end
  
end
