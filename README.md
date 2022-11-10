# Awuf-Booking-Api

API contains: 

Users/Admin Registration/Login with CRUD

Owners Registration/Login with CRUD

Hotel Managemnt with CRUD

## Fetch Api with the following instructions:
Use the root api [link](https://awuf-booking.azurewebsites.net/) to begin.

link = https://awuf-booking.azurewebsites.net/


## Users/Admin Accounts
use the link as reference
```
# Create user(post)
   link/api/auth/user/register

# Login user (post)
   link/api/auth/user/login

# See Available user/admin Email(post)
   link/api/auth/user/register/check


```
## Owner Accounts
use the link as reference
```
# Create user(post)
   link/api/auth/owner/register

# Login user (post)
   link/api/auth/owner/login

# See Available owner Email(post)
   link/api/auth/owner/register/check

```


## Available to everybody
use the link as reference
```

# Get all Hotel(get)
   link/api/hotels/

# Get a hotel(get)
   link/api/hotels/find/:id
   
############################      
# Get all Rooms(get)
   link/api/rooms/

# Get a Room(get)
   link/api/rooms/:id
############################
```

## Owners (Available to owners that are verified)
use the link as reference
```
# Create a Hotel(post)
   link/api/hotels/

# Update a hotel(put)
   link/api/hotels/edit/:id
 
############################
# Create a Room(post)
  link/api/rooms/:hotelid
 
# Update a Room(put)
   link/api/rooms/:id
   
 ############################
```

## Admin Features
use the link as reference
```

# Get users/admin(get)
   link/api/users/

# Delete user/admin(delete)
   link/api/users/:id

############################

# Get owners(get)
   link/api/owners/

# Delete owners(delete)
   link/api/owners/:id

############################

# Update a hotel to set to featured (put)
   link/api/hotels/:id
   
# Delete a hotel (delete)
   link/api/hotels/:id
 
############################  

# Delete a room (delete)
   link/api/rooms/:id/:hotelId
 
############################  
```

## Admin/User Features
use the link as reference
```

# Get one's details user(get)
   link/api/users/:id

# Update user(put)
   link/api/users/:id

# Update user's password(put)
   link/api/users/pass/:id

######################################
```

## Admin/Owner Features
use the link as reference
```

# Get one's details owner(get)
   link/api/owners/:id

# Update owners(put)
   link/api/owners/:id

# Update owners's password(put)
   link/api/owners/pass/:id

######################################
```


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to read this Readme as appropriate.

## Disclaimer 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
The author takes no responsibility for molten CPUs or lost data.
