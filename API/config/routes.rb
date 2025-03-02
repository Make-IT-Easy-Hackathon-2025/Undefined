Rails.application.routes.draw do

  mount ActionCable.server => '/cable'

  # Regisztráció és bejelentkezés végpontok
  post "/signup", to: "users#create"     # Új felhasználó létrehozása (regisztráció)
  post "/login", to: "sessions#create"   # Bejelentkezés és token generálás
  delete "/logout", to: "sessions#destroy" # Kilépés és token érvénytelenítés


  get "/user-info", to: "users#show"
  get "/verify", to: "users#verify"
  get "/check-admin", to: "users#check_admin"

  put "/onboarding", to: "users#onboarding"

  resources :subjects, only: [:create, :index]
  resources :posts do
    member do
      post :files
    end
  end

  put "/update-avatar", to: "users#update_avatar"

  resources :user_subjects, only: [] do
    collection do
      post :join
      get :user_subjects
      get :user_count
      delete :unsubscribe
    end
  end

  Rails.application.routes.draw do
    resources :chapters, only: [] do
      collection do
        post :generate_all_titles
      end
    end
  end
  


  get "/process_files/:id", to: "posts#process_files"

  resources :posts do
    resources :likes, only: [:create, :destroy, :index]
    resources :dislikes, only: [:create, :destroy, :index]
    resources :comments, only: [:create, :destroy, :index]
  end

  resources :documents, only: [] do
    resources :chapters, only: [] do
      member do
        post :generate_data
      end
    end
  end

  resources :exam_submissions, only: [:create, :show] do
    member do
      post :grade
    end
  
    collection do
      get 'by_document_and_chapter', to: 'exam_submissions#show'
    end
  end
  
  
  

  resources :chapters, only: [] do
    collection do
      get :titles
      get :document_chapters
    end
  end

  resources :uploaded_files, only: [:create, :index]

  # Jelszókezelés (opcionális)
  resources :passwords, param: :token, only: [:create, :update]

  # Egyszerű health check endpoint
  get "up" => "rails/health#show", as: :rails_health_check
end
