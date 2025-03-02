class Post < ApplicationRecord
    include PgSearch::Model

    belongs_to :subject
    belongs_to :user
    has_many :comments, dependent: :destroy
    has_many :likes, dependent: :destroy
    has_many :dislikes, dependent: :destroy
    has_many :documents, dependent: :destroy

    pg_search_scope :search_by_title_and_description,
                  against: [:title, :description],
                  using: {
                    tsearch: { prefix: true }, 
                    trigram: {}
                  }
  end
  