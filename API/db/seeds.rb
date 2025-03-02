# db/seeds.rb

require 'securerandom'
require 'bcrypt'

puts "🔹 Seedelés megkezdődött..."

puts "⚠️  Korábbi adatok törlése..."
Post.destroy_all
SubjectSpecialization.destroy_all
Subject.destroy_all
Specialization.destroy_all
User.destroy_all
Document.destroy_all
Chapter.destroy_all

puts "👤 Felhasználók létrehozása..."
users = User.create!([
  { 
    email_address: "adam.kiss@example.hu", 
    password_digest: BCrypt::Password.create("jelszo1"), 
    role: "user", 
    firstname: "Ádám", 
    lastname: "Kiss", 
    institution: "Sapientia Hungarian University of Transylvania", 
    country: "Romania", 
    educationlevel: "Egyetem", 
    usageplan: "premium" 
  },
  { 
    email_address: "bella.nemeth@example.hu", 
    password_digest: BCrypt::Password.create("jelszo2"), 
    role: "user", 
    firstname: "Bella", 
    lastname: "Németh", 
    institution: "Sapientia Hungarian University of Transylvania", 
    country: "Romania", 
    educationlevel: "Egyetem", 
    usageplan: "basic" 
  },
  { 
    email_address: "cecilia.toth@example.hu", 
    password_digest: BCrypt::Password.create("jelszo3"), 
    role: "user", 
    firstname: "Cecília", 
    lastname: "Tóth", 
    institution: "Sapientia Hungarian University of Transylvania", 
    country: "Romania", 
    educationlevel: "PhD", 
    usageplan: "enterprise" 
  },
  { 
    email_address: "david.farkas@example.hu", 
    password_digest: BCrypt::Password.create("jelszo4"), 
    role: "user", 
    firstname: "Dávid", 
    lastname: "Farkas", 
    institution: "Sapientia Hungarian University of Transylvania", 
    country: "Romania", 
    educationlevel: "Egyetem", 
    usageplan: "premium" 
  }
])
puts "✅ Felhasználók sikeresen létrehozva! (#{User.count} db)"

puts "🎓 Specializációk létrehozása..."
specializations_data = [
  { name: "Informatika" },
  { name: "Automatizálás" },
  { name: "Gépészmérnöki" },
  { name: "Távközlés" },
  { name: "Mechatronika" },
  { name: "Számítástechnika" },
  { name: "Tájépítészet" },
  { name: "Kertészmérnöki" }
]
specializations = Specialization.create!(specializations_data)
puts "✅ Specializációk sikeresen létrehozva! (#{Specialization.count} db)"


subjects_data = [
  { title: "Hálozatok", year: 3 },
  { title: "Adatbázisok", year: 2 },
  { title: "Android programozás", year: 4 },
  { title: "Párhuzamos programozás", year: 4 }
]
subjects = subjects_data.map do |subject|
  Subject.create!(subject)
end
puts "✅ Tantárgyak sikeresen létrehozva! (#{Subject.count} db)"

specializations.each do |spec|
  subjects_data = if spec.name == "Számítástechnika"
    [
      { title: "Hálozatok", year: 3 },
      { title: "Adatbázisok", year: 2 },
      { title: "Android programozás", year: 4 },
      { title: "Párhuzamos programozás", year: 4 }
    ]
  else
    # Élethű tantárgynevek a különböző specializációkhoz
    subject_names = case spec.name
      when "Informatika"
        ["Programozás alapjai", "Adatstruktúrák és algoritmusok", "Szoftvertervezés", "Webfejlesztés"]
      when "Automatizálás"
        ["PLC programozás", "Ipari automatizálás", "Robotika alapok", "SCADA rendszerek"]
      when "Gépészmérnöki"
        ["Gépszerelés és karbantartás", "Hőtechnika alapjai", "Anyagismeret", "Mechanikai rendszerek"]
      when "Távközlés"
        ["Mobilhálózatok", "Optikai kommunikáció", "Vezeték nélküli technológiák", "5G rendszerek"]
      when "Mechatronika"
        ["Integrált rendszerek", "Robotika és automatizálás", "Szenzorok alkalmazása", "Beágyazott rendszerek"]
      when "Tájépítészet"
        ["Környezeti tervezés", "Zöld infrastruktúra", "Társadalmi tájtervezés", "Kulturális örökség integráció"]
      when "Kertészmérnöki"
        ["Növényvédelem és kártevő elleni védekezés", "Talajművelés", "Kerttervezés és -építés", "Öntözéstechnika"]
      else
        ["Tantárgy 1", "Tantárgy 2", "Tantárgy 3", "Tantárgy 4"]
      end
    subject_names.map { |name| { title: name, year: rand(1..4) } }
  end

  subjects_data.each do |subject_data|
    subject = Subject.create!(subject_data)
    SubjectSpecialization.create!(subject: subject, specialization: spec)
    puts "✅ Tantárgy létrehozva: #{subject.title} (#{spec.name} specializációhoz)"
  end
end

android = Subject.find_by(title: "Android programozás")
parhuzamos = Subject.find_by(title: "Párhuzamos programozás")
adatbazisok = Subject.find_by(title: "Adatbázisok")
halozatok = Subject.find_by(title: "Hálozatok")


# Válasszunk egy véletlenszerű felhasználót a posztok szerzőjének
random_user = User.all.sample
puts "📌 Véletlenszerű felhasználó kiválasztva: #{random_user.firstname} #{random_user.lastname}"

def attach_documents_and_process(post, filenames)
  filenames.each do |filename|
    puts "📂 Dokumentum létrehozása: #{filename}"

    filepath = Rails.root.join("tananyagok", filename)
    document = Document.create!(post_id: post.id, filename: filename)

    document.file.attach(
      io: File.open(filepath),
      filename: filename,
      content_type: "application/pdf"
    )
  end

  begin
    puts "🛠️  ProcessPostDocumentsJob futtatása a poszthoz: #{post.title} (ID: #{post.id})"
    ProcessPostDocumentsJob.perform_now(post.id)
    puts "✅ ProcessPostDocumentsJob sikeresen befejeződött a poszthoz: #{post.title}"
  rescue StandardError => e
    puts "❌ HIBA: ProcessPostDocumentsJob sikertelen a poszthoz: #{post.title}! #{e.message}"
  end
end

puts "📝 'Kotlin programozás' poszt létrehozása..."

# Posztok létrehozása az új tantárgyakhoz

all_subjects = Subject.all
threads = []
posts = []

all_subjects.each do |subject|
  threads << Thread.new do
    # Készítünk egy poszt címet és tartalmat a tantárgy alapján
    post_title = "#{subject.title} - Bemutató poszt"
    post_content = case subject.title
                   when "Hálozatok"
                     "A hálózatok mélyreható vizsgálata: a kommunikáció alapjai, protokollok és modern megoldások a biztonságos adatátvitel érdekében."
                   when "Adatbazisok"
                     "Az adatbázisok struktúrája és optimalizálása: a hatékony adatkezelés és lekérdezés titkai."
                   when "Android programozás"
                     "Az Android platformon való fejlesztés alapjai: felhasználói interfész, alkalmazás architektúrája és modern eszközök bemutatása."
                   when "Párhuzamos programozás"
                     "A párhuzamos programozás technikái: szálak, processzek és az optimális erőforrás-kezelés kihívásai a mai rendszerekben."
                   else
                     "A(z) #{subject.title} témakör átfogó bemutatása, mely részletesen ismerteti a legfontosabb elméleteket és gyakorlati alkalmazásokat."
                   end

    post = Post.create!(
      title: post_title,
      content: post_content,
      subject_id: subject.id,
      user_id: random_user.id
    )

    posts << post  # 🔹 Minden létrehozott posztot mentünk a listába

    # Ha a tantárgy a "Számítástechnika" specializációhoz tartozik, fájlok csatolása
    if subject.specializations.any? { |s| s.name == "Számítástechnika" }
      files = case subject.title
              when "Android programozás"
                ["2_Variables.pdf", "3_Fuctions.pdf", "4_Conditionals.pdf"]
              when "Párhuzamos programozás"
                ["parhuzamos-1-30.pdf", "parhuzamos-30-60.pdf"]
              when "Adatbazisok"
                ["tarolt-eljarasok.pdf"]
              when "Hálozatok"
                ["halozatok.pdf"]
              else
                []
              end
      attach_documents_and_process(post, files) if files.any?
    end

    puts "✅ Poszt létrehozva: #{post.title}"
  end
end

threads.each(&:join)
puts "✅ Minden poszt sikeresen létrehozva!"

puts "👍👎 Lájkok és diszlájkok generálása..."
posts.each do |post|
  users.sample(rand(1..3)).each do |user|
    if rand < 0.7  # 70% esély lájk, 30% diszlájk
      Like.create!(user: user, post: post)
      puts "👍 #{user.firstname} lájkolta: #{post.title}"
    else
      Dislike.create!(user: user, post: post)
      puts "👎 #{user.firstname} diszlájkolta: #{post.title}"
    end
  end
end
puts "✅ Lájkok és diszlájkok sikeresen létrehozva!"

puts "💬 Kommentek generálása..."
comments_texts = [
  "Nagyon hasznos anyag!",
  "Nem értek egyet ezzel a ponttal.",
  "Valaki tudna segíteni ebben?",
  "Köszönöm az összefoglalót!",
  "Tetszik az anyag, de kicsit részletesebb is lehetne."
]

posts.each do |post|
  users.sample(rand(1..4)).each do |user|
    comment_text = comments_texts.sample
    Comment.create!(user: user, post: post, content: comment_text)
    puts "💬 #{user.firstname} kommentelt: '#{comment_text}' a posztra: #{post.title}"
  end
end
puts "✅ Kommentek sikeresen létrehozva!"

puts "✅ Tantárgyak posztjai és dokumentumok sikeresen feltöltve!"
puts "🎉 Seedelés befejeződött!"