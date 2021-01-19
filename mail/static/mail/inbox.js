document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email); 


  //By default, load the inbox
  load_mailbox('inbox');

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
  document.querySelector('#view-mail').style.display = 'none';
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

  // Clear divs before loading 
  const container = document.querySelector('#mailbox');
  container.innerHTML = "";
  const mailview = document.querySelector('#view-mail');
  mailview.innerHTML = "";

  //Load mails from JSON
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(email => {
    email.forEach(x => {
      const element = document.createElement('div');
      element.className = "mail"
      element.innerHTML = ('<div class="sender">' + `${x.sender}` + '</div>' 
                          + '<div class="subject">' + `${x.subject}` + '</div>' 
                          + '<div class="time">' + `${x.timestamp}` + '</div>');
      element.style.backgroundColor = (x.read == true) ? "gray" : "white";
      
      //OnClick for each email
      element.addEventListener('click', function() {
        fetch(`/emails/${x.id}`)
        .then(response => response.json())
        .then(mail => {
          
          //Mail General Info
          const mail_info = document.createElement('div');
          mail_info.innerHTML = ('<div>' + `From: ${mail.sender}` + '</div>' 
                              + '<div>' + `To: ${mail.recipients}` + '</div>' 
                              + '<div>' + `Subject: ${mail.subject}` + '</div>'
                              + '<div>' + `Timestamp: ${mail.timestamp}` + '</div>');
          mailview.append(mail_info);
          
          //archive button function 
          if (mailbox != 'sent')
          {
            const archive = document.createElement('button');
            archive.className = "btn btn-sm btn-outline-primary";
            archive.innerHTML = (mail.archived) ? 'Unarchive' : 'Archive';  //ternary operator similar to if else
            archive.addEventListener('click', function(){
              fetch(`/emails/${mail.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: !mail.archived
                })
              })
              .then( () => {
                load_mailbox('inbox');
              });
            })
            mailview.append(archive);
          }
          
          //Reply button function
          const reply = document.createElement('button');
          reply.className = "btn btn-sm btn-outline-primary";
          reply.innerHTML = "Reply";
          reply.addEventListener('click', function(){
            compose_email();
            //Pre-fill Compose Email fields
            document.querySelector('#compose-recipients').value = `${mail.sender}`;
            document.querySelector('#compose-subject').value = (mail.subject.includes("Re:")) ? `${mail.subject}` : `Re: ${mail.subject}`;
            document.querySelector('#compose-body').value = `"On ${mail.timestamp} ${mail.sender} wrote : ${mail.body}"`; 
          })
          mailview.append(reply);
        
          //Body of email
          const message = document.createElement('p');
          message.innerHTML = `${mail.body}`;
          message.innerHTML = message.innerHTML.replace(/\n/g, "<br>"); //changes \n (new line) to <br>
          mailview.append(message);

          //Mark email as read
          fetch(`/emails/${mail.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })

        })
        container.style.display = 'none';
        mailview.style.display = 'block';
      });

      container.append(element); //add individual element along with specific functionality to email list

    })

  });

}