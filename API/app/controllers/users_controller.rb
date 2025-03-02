class UsersController < ApplicationController
    skip_before_action :require_authentication, only: [:create]
  
    def create
      user = User.new(user_params)
    
      if User.exists?(email_address: user.email_address)
        render json: { error: "Email already in use" }, status: :unprocessable_entity
      elsif user.save
        session = user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip)
        render json: {
          token: session.token,
          user: user.as_json(except: [:password_digest])
        }, status: :created
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end
    

    def show
      user = Current.session.user
      render json: {
          id: user.id,
          email_address: user.email_address,
          firstname: user.firstname,
          lastname: user.lastname,
          institution: user.institution,
          country: user.country,
          educationlevel: user.educationlevel,
          usageplan: user.usageplan,
          avatar_url: user.avatar_url
      }
    end
    

    def verify
        if Current.session&.user
          render json: user_response(Current.session.user, logged_in: true)
        else
          render json: { loggedIn: false }, status: :unauthorized
        end
    end

    def check_admin
        render json: { admin: Current.session.user.admin? }
    end

    def onboarding
        user = Current.session.user
      
        if user.update(onboarding_params)
          render json: { message: "Onboarding sikeres", user: user }, status: :ok
        else
          render json: { error: "Nem sikerült frissíteni a felhasználót", details: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update_avatar
        user = Current.session.user
    
        if params[:avatar].present? && user.update(avatar: params[:avatar])
          render json: { message: "Avatar successfully updated", avatar_url: user.avatar_url }
        else
          render json: { error: "Failed to upload avatar" }, status: :unprocessable_entity
        end
      end
  
    private
  
    def user_params
      params.require(:user).permit(:email_address, :password, :password_confirmation)
    end

    def onboarding_params
        params.require(:user).permit(:firstname, :lastname, :institution, :country, :educationlevel, :usageplan)
      end

    def user_response(user, logged_in: false)
        {
          loggedIn: logged_in,
          user: user
        }
    end
  end
  