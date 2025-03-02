class Chapter < ApplicationRecord
  belongs_to :document

  validates :chapter_type, inclusion: { in: %w[chapter exam exam_review] }, allow_nil: true

end
