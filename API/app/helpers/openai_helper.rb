module OpenaiHelper
    require 'openai'
    
    def self.client
      api_key = Rails.application.credentials.dig(:openai, :api_key)
      @client ||= OpenAI::Client.new(access_token: api_key)
    end
    
    # Szöveg kiegészítés lekérése
    #
    # @param system_prompt [String] A rendszernek adott prompt
    # @param user_prompt [String] A felhasználói prompt
    # @param model [String] Az OpenAI modell neve (pl. "gpt-3.5-turbo")
    # @param max_tokens [Integer] Maximum generálható tokenek száma
    # @param json_response [Boolean] Igaz esetén JSON formátumot várunk
    # @return [Hash] {:completion => String, :tokens_used => Integer}
    def self.get_completion(system_prompt, user_prompt, model: 'gpt-4o-mini', max_tokens: 2048, json_response: false)
      params = {
        model: model,
        messages: [
          { role: "system", content: system_prompt },
          { role: "user", content: user_prompt }
        ],
        max_tokens: max_tokens
      }
      params[:response_format] = { type: 'json_object' } if json_response
  
      Rails.logger.debug "OpenAI API request params: #{params.except(:messages).inspect}"
      
      response = client.chat(parameters: params)
      
      Rails.logger.debug "OpenAI API raw response: #{response.inspect}"
      
      completion = response["choices"][0]["message"]["content"].strip
      tokens_used = response["usage"]["total_tokens"]
      
      { completion: completion, tokens_used: tokens_used }
    rescue StandardError => e
      Rails.logger.error "OpenAI API error: #{e.message}"
      Rails.logger.error "Request params: #{params.inspect}"
      raise "Failed to get completion from OpenAI"
    end
    
    # Szöveg embedding generálása
    #
    # @param text [String] A bemeneti szöveg
    # @param model [String] Az embedding modell (pl. "text-embedding-3-small")
    # @return [Hash] {:embedding => Array<Float>, :tokens_used => Integer}
    def self.get_embedding(text, model: "text-embedding-3-small")
      params = {
        model: model,
        input: text
      }
      
      Rails.logger.debug "OpenAI Embedding request params: #{params.except(:input).inspect}"
      
      response = client.embeddings(parameters: params)
      
      Rails.logger.debug "OpenAI Embedding raw response: #{response.inspect}"
      
      embedding = response["data"][0]["embedding"]
      tokens_used = response["usage"]["total_tokens"]
      
      { embedding: embedding, tokens_used: tokens_used }
    rescue StandardError => e
      Rails.logger.error "OpenAI Embedding API error: #{e.message}"
      Rails.logger.error "Embedding request params: #{params.inspect}"
      raise "Failed to generate embedding"
    end
  end
  