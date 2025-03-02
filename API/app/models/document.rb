# app/models/document.rb
class Document < ApplicationRecord
  belongs_to :post
  # A Documenthez kapcsolódik egy ActiveStorage attachment, itt nevezzük el "file"-nak:
  has_one_attached :file

  before_save :set_filename

  # Ha később a feldolgozott tartalmakat (chapter-eket) is szeretnéd kapcsolni, has_many :chapters
  has_many :chapters, dependent: :destroy

  private

  def set_filename
    self.filename = file.filename.to_s
  end
end
