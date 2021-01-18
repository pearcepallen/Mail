document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email); 


  //By default, load the inbox
  load_mailbox('inbox');

  //Get Inbix


  // Send Mail API 
  document.querySelector('#compose-form').addEventListener('submit', (event) => {
    event.preventDefault()
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent');
    });
  });

});



function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mailbox').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#mailbox').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  const container = document.querySelector('#mailbox');
  container.innerHTML = "";
  document.querySelector('#view-mail').innerHTML = " ";

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(email => {
    email.forEach(x => {
      const element = document.createElement('div');
      element.className = "mail"
      element.innerHTML = ('<div class="sender">' + `${x.sender}` + '</div>' 
                          + '<div class="subject">' + `${x.subject}` + '</div>' 
                          + '<div class="time">' + `${x.timestamp}` + '</div>');
      
      element.addEventListener('click', function() {
        fetch(`/emails/${x.id}`)
          .then(response => response.json())
          .then(mail => {
            const mail_info = document.createElement('div');
            mail_info.innerHTML = ('<div>' + `From: ${mail.sender}` + '</div>' 
                                + '<div>' + `To: ${mail.recipients}` + '</div>' 
                                + '<div>' + `Subject: ${mail.subject}` + '</div>'
                                + '<div>' + `Timestamp: ${mail.timestamp}` + '</div>');
            document.querySelector('#view-mail').append(mail_info);

            const message = document.createElement('p');
            message.innerHTML = `${mail.body}`;
            document.querySelector('#view-mail').append(message);

            fetch(`/emails/${mail.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  read: true
              })
            })

          })
        document.querySelector('#mailbox').style.display = 'none';
        document.querySelector('#view-mail').style.display = 'block';
      });

      container.append(element);
    })
  });

}