class SessionsController < ApplicationController
  skip_before_action :require_authentication, only: [:create]

  def create
    user = User.find_by(email_address: params[:user][:email_address])

    if user&.authenticate(params[:user][:password])
      session = user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip)
      render json: {
        token: session.token,
        user: user.as_json(except: [:password_digest])
      }, status: :created
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  def destroy
    Current.session.destroy
    head :no_content
  end
end
