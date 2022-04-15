checkUser = address => {
  return new Promise(function (resolve, reject) {
    $.ajax({
      type: 'GET',
      url: '/statedata?address=' + address,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      success: function (result) {
        $.post(
          '/VerifyData',
          { result },
          (data, textStatus, jqXHR) => {
            resolve(data.status[1])
          },
          'json'
        ).fail(() => {
          reject()
        })
      },
      error: () => {
        reject()
      }
    })
  })
}
loginUser = event => {
  event.preventDefault()
  sessionStorage.clear()
  const privateKey = document.getElementById('priv_key').value
  sessionStorage.setItem('privatekey', privateKey)
  if (!privateKey) {
    alert('Input is empty')
  } else {
    $.post(
      '/getKeyAndAddress',
      { privateKey },
      (data, textStatus, jqXHR) => {
        sessionStorage.setItem('pub_key', data.pub_key)
        checkUser(data.address)
          .then(status => {
            var date2 = new Date()
            let minute = parseInt((date2 - status) / (1000 * 60))// 1000*60*60*24 for one day
            if (5 <= minute) {
              window.location.href = '/userPageAllowEdit'
            } else {
              window.location.href = '/userPageDenyEdit'
            }
          })
          .catch(() => {
            window.location.href = '/userPageAllowEdit'
          })
      },
      'json'
    )
  }
}

postUserData = event => {
  event.preventDefault()
  const privateKey = sessionStorage.getItem('privatekey')
  const pub_key = sessionStorage.getItem('pub_key')
  const id = document.getElementById('ID').value
  const hologramID = document.getElementById('HologramID').value
  const fromNumber = document.getElementById('FromNumber').value
  const toNumber = document.getElementById('ToNumber').value
  const quantity = document.getElementById('Quantity').value
  const organisationID = document.getElementById('OrganisationID').value
  const isActive = document.getElementById('IsActive').value
  // const createdDate = document.getElementById('CreatedDate').value
  const wareHouseID = document.getElementById('WareHouseID').value
  const prefix = document.getElementById('Prefix').value
  const enKey = document.getElementById('enKey').value
  try {
    if (true) {
      $.post(
        '/userData',
        {
          privateKey: privateKey,
          pub_key: pub_key,
          id: id,
          hologramID: hologramID,
          fromNumber: fromNumber,
          toNumber: toNumber,
          quantity: quantity,
          organisationID: organisationID,
          isActive: isActive,
          createdDate: '05/05/2002',
          wareHouseID: wareHouseID,
          prefix: prefix,
          enKey: enKey,
        },
        'json'
      )
      console.log("VALIDATIOmn")
      alert("Data successfully send to police")
    } else {
      alert("Please enter valid aadhar , voter id ,pincode details")
    }
  } catch (err) {
    console.log("ERR IS ", err)
  }

}
getUserData = event => {
  event.preventDefault()
  pub_key = sessionStorage.getItem('pub_key')
  deKey = $('#deKey').val()
  $.post(
    '/getAddressFromPubKey',
    { pub_key },
    (data, textStatus, jqXHR) => {
      console.log(data)
      $.ajax({
        type: 'GET',
        url: '/statedata?address=' + data.address,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        success: function (result) {
          console.log(result)
          $.post(
            '/decryptData',
            { result, deKey },
            (data, textStatus, jqXHR) => {
              $('#id').text(data.user[0])
              $('#hologramID').text(data.user[1])
              $('#fromNumber').text(data.user[2])
              $('#toNumber').text(data.user[3])
              $('#quantity').text(data.user[4])
              $('#organisationID').text(data.user[5])
              $('#isActive').text(data.user[6])
              //$('#createdDate').text(data.user[7])
              $('#wareHouseID').text(data.user[8])
              $('#prefix').text(data.user[9])
              console.log(data.status)
              if (data.status[0] == 1) {
                var date2 = new Date()
                let minute = parseInt(
                  (date2 - data.status[1]) / (1000 * 60)// 1000*60*60*24 for one day
                )
                console.log(minute)
                // date add cheyithathu ini edit cheyyumobol check cheyyanam
                $('#status').text('Verifed  :' + minute + '  minutes Old')
              } else {
                $('#status').text(' Not Verifed')
              }
              $('#pub_key').text(data.user[7])
              $('#moreData').modal('show')
            },
            'json'
          )
        }
      })
    },
    'json'
  )
}
updateEncKey = event => {
  event.preventDefault()
  priv_key = sessionStorage.getItem('privatekey')
  oldKey = $('#oldKey').val()
  newKey = $('#newKey').val()
  console.log("Changin key")
  $.post(
    '/changeEnckey',
    { priv_key, oldKey, newKey },
    (data, textStatus, jqXHR) => {
      if (data.msg == 1) {
        alert('Encryption key Changed Successfully')
      } else {
        alert('key Not Changed')
      }
    },
    'json'
  )
}
$('#decryptKey').on('show.bs.modal', event => {
  const button = $(event.relatedTarget)
  const pub_key = sessionStorage.getItem('pub_key')
  $('#decrypt').attr('data-state', pub_key)
})

document.getElementById('publicKeyOnUserForm').value = sessionStorage.getItem(
  'pub_key'
)
document.getElementById('ID').value = 001
document.getElementById('HologramID').value = 89
document.getElementById('FromNumber').value = 1200
document.getElementById('ToNumber').value = 1300
document.getElementById('Quantity').value = 10000
document.getElementById('OrganisationID').value = 12345
document.getElementById('IsActive').value = 123456
// document.getElementById('CreatedDate').value = '05-04-2022'
document.getElementById('WareHouseID').value = 123
document.getElementById('Prefix').value = 'BB123'
