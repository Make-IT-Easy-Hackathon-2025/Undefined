class ExamSubmission < ApplicationRecord
  belongs_to :user
  belongs_to :exam, class_name: "Chapter"
  belongs_to :document

  validates :answers, presence: true
end
