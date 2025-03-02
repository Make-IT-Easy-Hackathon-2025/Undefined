class Dislike < ApplicationRecord
  belongs_to :user
  belongs_to :post

  validates :user_id, uniqueness: { scope: :post_id, message: "Már dislike-oltad ezt a posztot" }

end
