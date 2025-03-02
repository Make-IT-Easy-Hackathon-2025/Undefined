class Specialization < ApplicationRecord
    has_many :subject_specializations, dependent: :destroy
    has_many :subjects, through: :subject_specializations
  end