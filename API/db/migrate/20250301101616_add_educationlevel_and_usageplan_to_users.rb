class AddEducationlevelAndUsageplanToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :educationlevel, :string
    add_column :users, :usageplan, :string
  end
end
