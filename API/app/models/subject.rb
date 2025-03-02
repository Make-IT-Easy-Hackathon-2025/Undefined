class Subject < ApplicationRecord
    include PgSearch::Model

    has_many :subject_specializations, dependent: :destroy
    has_many :specializations, through: :subject_specializations
    has_many :user_subjects, dependent: :destroy
  has_many :users, through: :user_subjects

    pg_search_scope :search_by_title, against: :title, using: {
        tsearch: { prefix: true },
        trigram: {}
    }
  end