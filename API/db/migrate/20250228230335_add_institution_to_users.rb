class AddInstitutionToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :institution, :string
  end
end
